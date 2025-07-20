import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  serviceAddress: text("service_address"),
  serviceLatitude: real("service_latitude"),
  serviceLongitude: real("service_longitude"),
  comment: text("comment"),
  reportedAt: text("reported_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  userIp: text("user_ip"),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
