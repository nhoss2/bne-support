import { Hono } from "hono";
import { cors } from "hono/cors";
import { html } from "hono/html";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDb } from "./db";
import { reports } from "./schema";
import type { NewReport } from "./schema";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

const corsConfig = cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    "https://www.brisbanesupport.org",
    "https://brisbanesupport.org",
  ],
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
});

app.use("/api/*", corsConfig);
app.use("/admin/api/*", corsConfig);

const reportSchema = z.object({
  serviceName: z.string().min(1),
  serviceAddress: z.string().optional(),
  serviceLatitude: z.number().optional(),
  serviceLongitude: z.number().optional(),
  comment: z.string().max(500).optional(),
});

app.get("/", (c) => {
  return c.text("BNE Support API");
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/reports", zValidator("json", reportSchema), async (c) => {
  try {
    console.log("Environment:", c.env);
    const db = getDb(c.env);
    const validated = c.req.valid("json");

    const newReport: NewReport = {
      serviceName: validated.serviceName,
      serviceAddress: validated.serviceAddress || null,
      serviceLatitude: validated.serviceLatitude || null,
      serviceLongitude: validated.serviceLongitude || null,
      comment: validated.comment || null,
      userIp:
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        "unknown",
    };
    const result = await db.insert(reports).values(newReport).returning();

    return c.json({ success: true, report: result[0] }, 201);
  } catch (error) {
    console.error("Error creating report:", error);
    return c.json({ error: "Failed to create report" }, 500);
  }
});

// Admin API endpoints
app.get("/admin/api/reports", async (c) => {
  try {
    const db = getDb(c.env);
    const allReports = await db
      .select()
      .from(reports)
      .orderBy(reports.reportedAt);
    return c.json({ reports: allReports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return c.json({ error: "Failed to fetch reports" }, 500);
  }
});

app.get("/admin/", async (c) => {
  try {
    const db = getDb(c.env);
    const allReports = await db
      .select()
      .from(reports)
      .orderBy(reports.reportedAt);

    return c.html(html`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BNE Support - Reports Admin</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              margin: 2rem;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
            }
            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .timestamp {
              font-size: 0.9em;
              color: #666;
            }
            .comment {
              max-width: 300px;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h1>Service Reports Admin</h1>
          <p>Total reports: ${allReports.length}</p>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Service Name</th>
                <th>Address</th>
                <th>Coordinates</th>
                <th>Comment</th>
                <th>User IP</th>
                <th>Reported At</th>
              </tr>
            </thead>
            <tbody>
              ${allReports.map(
                (report) => html`
                  <tr>
                    <td>${report.id}</td>
                    <td>${report.serviceName}</td>
                    <td>
                      ${report.serviceAddress || html`<em>No address</em>`}
                    </td>
                    <td>
                      ${report.serviceLatitude && report.serviceLongitude
                        ? `${report.serviceLatitude}, ${report.serviceLongitude}`
                        : html`<em>No coordinates</em>`}
                    </td>
                    <td class="comment">
                      ${report.comment || html`<em>No comment</em>`}
                    </td>
                    <td>${report.userIp}</td>
                    <td class="timestamp">
                      ${new Date(report.reportedAt).toLocaleString()}
                    </td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching reports for admin:", error);
    return c.html("<h1>Error loading reports</h1>", 500);
  }
});

export default app;
