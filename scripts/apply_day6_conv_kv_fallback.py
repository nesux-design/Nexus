#!/usr/bin/env python3
"""Day-6: Fix conversationId null — KV fallback when Supabase create fails."""
from pathlib import Path

NEW_METHODS = r'''
  async _kvListConversationIds() {
    if (!this.kv || !this.userId) return [];
    try {
      const listKey = "conv_index:" + this.userId;
      const ids = await this.kv.get(listKey, { type: "json" });
      return Array.isArray(ids) ? ids : [];
    } catch (_) {
      return [];
    }
  }
  async _kvUpsertConversation(id, record) {
    if (!this.kv || !this.userId || !id) return;
    const listKey = "conv_index:" + this.userId;
    const dataKey = "conv_data:" + this.userId + ":" + id;
    await this.kv.put(dataKey, JSON.stringify(record));
    let ids = await this._kvListConversationIds();
    if (!ids.includes(id)) ids = [id, ...ids];
    // keep last 300 index entries max
    ids = ids.slice(0, 300);
    await this.kv.put(listKey, JSON.stringify(ids));
  }
  async _kvGetConversation(id) {
    if (!this.kv || !this.userId || !id) return null;
    try {
      return await this.kv.get("conv_data:" + this.userId + ":" + id, { type: "json" });
    } catch (_) {
      return null;
    }
  }
  async _kvListConversations() {
    const ids = await this._kvListConversationIds();
    const out = [];
    for (const id of ids) {
      const row = await this._kvGetConversation(id);
      if (row) out.push(row);
    }
    out.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
    return out;
  }
  async _kvDeleteConversation(id) {
    if (!this.kv || !this.userId || !id) return false;
    try {
      await this.kv.delete("conv_data:" + this.userId + ":" + id);
      let ids = await this._kvListConversationIds();
      ids = ids.filter((x) => x !== id);
      await this.kv.put("conv_index:" + this.userId, JSON.stringify(ids));
      return true;
    } catch (_) {
      return false;
    }
  }
'''

def main():
    p = Path("worker.ts")
    t = p.read_text()
    changes = []

    if "_kvUpsertConversation" not in t:
        # Insert helpers before saveChatToSupabase
        anchor = "  async saveChatToSupabase(conversationId, messages, title) {"
        if anchor not in t:
            raise SystemExit("saveChatToSupabase not found")
        t = t.replace(anchor, NEW_METHODS + "\n" + anchor, 1)
        changes.append("kv-helpers")

    old_save = '''  async saveChatToSupabase(conversationId, messages, title) {
    try {
      if (conversationId) {
        const existingResponse = await this.supabase.rest("GET", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId) + "&select=id", null, null);
        if (existingResponse.ok) {
          const existingConvs = await existingResponse.json();
          if (existingConvs.length > 0) {
            const updates = { messages: JSON.stringify(messages), updated_at: (/* @__PURE__ */ new Date()).toISOString() };
            if (title)
              updates.title = title;
            await this.supabase.rest("PATCH", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId), updates, null);
            return conversationId;
          }
        }
      }
      const newConv = { user_id: this.userId, title: title || "New Chat", messages: JSON.stringify(messages), created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() };
      const created = await this.supabase.createConversation(newConv);
      return created ? created.id : null;
    } catch (e) {
      return null;
    }
  }'''

    new_save = '''  async saveChatToSupabase(conversationId, messages, title) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const id = conversationId || crypto.randomUUID();
    const record = {
      id,
      user_id: this.userId,
      title: title || "New Chat",
      messages: Array.isArray(messages) ? messages : [],
      created_at: now,
      updated_at: now
    };
    try {
      if (conversationId) {
        const existingResponse = await this.supabase.rest("GET", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId) + "&select=id", null, null);
        if (existingResponse.ok) {
          const existingConvs = await existingResponse.json();
          if (existingConvs.length > 0) {
            const updates = { messages: JSON.stringify(messages), updated_at: now };
            if (title) updates.title = title;
            await this.supabase.rest("PATCH", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId), updates, null);
            record.created_at = existingConvs[0].created_at || now;
            await this._kvUpsertConversation(conversationId, record);
            return conversationId;
          }
        }
      }
      const newConv = { id, user_id: this.userId, title: record.title, messages: JSON.stringify(messages), created_at: now, updated_at: now };
      const created = await this.supabase.createConversation(newConv);
      if (created && created.id) {
        record.id = created.id;
        await this._kvUpsertConversation(created.id, record);
        return created.id;
      }
      console.error("saveChatToSupabase: Supabase create returned empty, using KV fallback");
    } catch (e) {
      console.error("saveChatToSupabase supabase error:", e && e.message);
    }
    await this._kvUpsertConversation(id, record);
    return id;
  }'''

    if old_save in t:
        t = t.replace(old_save, new_save, 1)
        changes.append("save-kv-fallback")
    else:
        print("WARN: exact save block not found")

    # getChatFromSupabase: merge KV when list empty / id miss
    old_get = '''  async getChatFromSupabase(conversationId) {
    try {
      if (conversationId) {
        const res = await this.supabase.rest("GET", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId) + "&select=*", null, null);
        if (res.ok) {
          const convs = await res.json();
          if (convs.length > 0) {
            const conv = convs[0];
            if (typeof conv.messages === "string") {
              try {
                conv.messages = JSON.parse(conv.messages);
              } catch (e) {
                conv.messages = [];
              }
            }
            return conv;
          }
        }
        return null;
      }
      return await this.supabase.getConversations(this.userId);
    } catch (e) {
      return [];
    }
  }'''

    new_get = '''  async getChatFromSupabase(conversationId) {
    try {
      if (conversationId) {
        try {
          const res = await this.supabase.rest("GET", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId) + "&select=*", null, null);
          if (res.ok) {
            const convs = await res.json();
            if (convs.length > 0) {
              const conv = convs[0];
              if (typeof conv.messages === "string") {
                try { conv.messages = JSON.parse(conv.messages); } catch (e) { conv.messages = []; }
              }
              return conv;
            }
          }
        } catch (_) {}
        return await this._kvGetConversation(conversationId);
      }
      let remote = [];
      try { remote = await this.supabase.getConversations(this.userId); } catch (_) { remote = []; }
      if (!Array.isArray(remote)) remote = [];
      for (const conv of remote) {
        if (typeof conv.messages === "string") {
          try { conv.messages = JSON.parse(conv.messages); } catch (e) { conv.messages = []; }
        }
      }
      const local = await this._kvListConversations();
      if (!remote.length) return local;
      if (!local.length) return remote;
      const byId = new Map();
      for (const c of remote) if (c && c.id) byId.set(c.id, c);
      for (const c of local) if (c && c.id) byId.set(c.id, c);
      return Array.from(byId.values()).sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
    } catch (e) {
      return await this._kvListConversations();
    }
  }'''

    if old_get in t:
        t = t.replace(old_get, new_get, 1)
        changes.append("get-kv-merge")
    else:
        print("WARN: getChat block not exact")

    # delete: also KV
    old_del = '''  async deleteChatFromSupabase(conversationId) {
    try {
      const res = await this.supabase.rest("DELETE", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId), null, null);
      return res.ok;
    } catch (e) {
      return false;
    }
  }'''
    new_del = '''  async deleteChatFromSupabase(conversationId) {
    let ok = false;
    try {
      const res = await this.supabase.rest("DELETE", "conversations?id=eq." + encodeURIComponent(conversationId) + "&user_id=eq." + encodeURIComponent(this.userId), null, null);
      ok = res.ok;
    } catch (e) {
      ok = false;
    }
    const kvOk = await this._kvDeleteConversation(conversationId);
    return ok || kvOk;
  }'''
    if old_del in t:
        t = t.replace(old_del, new_del, 1)
        changes.append("delete-kv")

    p.write_text(t)
    print("changes:", changes or ["none"])
    if not changes:
        raise SystemExit("no changes")
    assert "_kvUpsertConversation" in t

if __name__ == "__main__":
    main()
