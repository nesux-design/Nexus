import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

export class TimeMcpServer extends McpAgent {
      server = new McpServer({ name: "time", version: "1.0" });

        async init() {
                this.server.tool(
                          "get_current_time",
                                { timezone: z.string().optional() },
                                      async ({ timezone }) => {
                                                const tz = timezone || "UTC";
                                                        const now = new Date().toLocaleString("en-US", { timeZone: tz });
                                                                return { content: [{ type: "text", text: `Current time in ${tz}: ${now}` }] };
                                      }
                );
        }
}