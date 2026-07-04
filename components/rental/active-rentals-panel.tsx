"use client";

import { generateContractPdf } from "@/lib/pdf/generate-contract";
import { fmt } from "@/lib/rental/constants";
import type {
  ActivityLogEntry,
  RentalHistoryFilter,
  RentalRecord,
} from "@/lib/rental/types";

type ActiveRentalsPanelProps = {
  rentals: RentalRecord[];
  filteredRentals: RentalRecord[];
  rentalFilter: RentalHistoryFilter;
  activity: ActivityLogEntry[];
  busy?: boolean;
  onFilterChange: (filter: RentalHistoryFilter) => void;
  onReturn: (id: string) => void;
  onDeleteRental: (id: string) => void;
  onDeleteAllRentals: () => void;
  onDeleteActivity: (id: number) => void;
  onDeleteAllActivity: () => void;
};

const FILTER_OPTIONS: { id: RentalHistoryFilter; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "out", label: "Идэвхтэй" },
  { id: "in", label: "Буцаасан" },
];

function activityActionLabel(entry: ActivityLogEntry) {
  if (entry.kind === "inventory") {
    if (entry.action === "create") return "Нэмсэн";
    if (entry.action === "update") return "Засвар";
    if (entry.action === "delete") return "Устгасан";
  }
  if (entry.kind === "rental") {
    if (entry.action === "checkout") return "Гаргасан";
    if (entry.action === "return") return "Ирүүлсэн";
    if (entry.action === "delete") return "Устгасан";
  }
  return entry.action;
}

function activityKindLabel(kind: ActivityLogEntry["kind"]) {
  return kind === "inventory" ? "Бараа" : "Түрээс";
}

export function ActiveRentalsPanel({
  rentals,
  filteredRentals,
  rentalFilter,
  activity,
  busy = false,
  onFilterChange,
  onReturn,
  onDeleteRental,
  onDeleteAllRentals,
  onDeleteActivity,
  onDeleteAllActivity,
}: ActiveRentalsPanelProps) {
  const activeCount = rentals.filter((r) => r.status === "out").length;
  const returnedCount = rentals.filter((r) => r.status === "in").length;

  return (
    <div className="panel-stack">
      <div className="panel">
        <div className="panel-head panel-head--wrap">
          <div>
            <strong>Үйлдлийн бүртгэл</strong>
            <div className="panel-sub">{activity.length} сүүлийн үйлдэл</div>
          </div>
          {activity.length > 0 && (
            <button
              type="button"
              className="btn sm danger ghost"
              disabled={busy}
              onClick={onDeleteAllActivity}
            >
              Бүгдийг устгах
            </button>
          )}
        </div>

        {activity.length === 0 ? (
          <div className="empty-state empty-state--card">
            Одоогоор бүртгэл байхгүй. Бараа нэмэх, засах, түрээс гаргах үед энд
            харагдана.
          </div>
        ) : (
          <div className="table-wrap table-wrap--flush">
            <table className="table-activity">
              <thead>
                <tr>
                  <th className="col-act-time">Цаг</th>
                  <th className="col-act-kind">Төрөл</th>
                  <th className="col-act-action">Үйлдэл</th>
                  <th className="col-act-summary">Тайлбар</th>
                  <th className="col-act-detail">Дэлгэрэнгүй</th>
                  <th className="col-act-actions"></th>
                </tr>
              </thead>
              <tbody>
                {activity.map((entry) => (
                  <tr key={entry.id}>
                    <td className="col-act-time mono muted">
                      {formatActivityTime(entry.createdAt)}
                    </td>
                    <td className="col-act-kind">
                      <span
                        className={`chip sm ${entry.kind === "inventory" ? "zero" : "out"}`}
                      >
                        {activityKindLabel(entry.kind)}
                      </span>
                    </td>
                    <td className="col-act-action">
                      {activityActionLabel(entry)}
                    </td>
                    <td className="col-act-summary">{entry.summary}</td>
                    <td className="col-act-detail muted">
                      {entry.detail ?? "—"}
                    </td>
                    <td className="col-act-actions">
                      <button
                        type="button"
                        className="btn sm danger ghost"
                        disabled={busy}
                        title="Устгах"
                        onClick={() => onDeleteActivity(entry.id)}
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head panel-head--wrap">
          <div>
            <strong>Түрээсийн түүх</strong>
            <div className="panel-sub">
              {rentals.length} бичлэг
              {activeCount > 0 && (
                <>
                  <span className="panel-sub__dot">·</span>
                  <span className="warn">{activeCount} идэвхтэй</span>
                </>
              )}
            </div>
          </div>
          <div className="panel-head__actions">
            <div className="filter-pills" role="tablist" aria-label="Түрээс шүүлтүүр">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={rentalFilter === opt.id}
                  className={`filter-pill${rentalFilter === opt.id ? " active" : ""}`}
                  onClick={() => onFilterChange(opt.id)}
                >
                  {opt.label}
                  {opt.id === "out" && activeCount > 0 && (
                    <span className="filter-pill__count">{activeCount}</span>
                  )}
                  {opt.id === "in" && returnedCount > 0 && (
                    <span className="filter-pill__count">{returnedCount}</span>
                  )}
                </button>
              ))}
            </div>
            {rentals.length > 0 && (
              <button
                type="button"
                className="btn sm danger ghost"
                disabled={busy}
                onClick={onDeleteAllRentals}
              >
                Бүгдийг устгах
              </button>
            )}
          </div>
        </div>

        {filteredRentals.length === 0 ? (
          <div className="empty-state empty-state--card">
            {rentalFilter === "all"
              ? 'Одоогоор түрээс байхгүй. "Шинэ түрээс" табаас үүсгэнэ үү.'
              : rentalFilter === "out"
                ? "Идэвхтэй түрээс байхгүй."
                : "Буцаасан түрээс байхгүй."}
          </div>
        ) : (
          <div className="table-wrap table-wrap--flush">
            <table className="table-active">
              <thead>
                <tr>
                  <th className="col-date">Огноо</th>
                  <th className="col-cust">Түрээслэгч</th>
                  <th className="col-items">Бараа</th>
                  <th className="col-dur">Хугацаа</th>
                  <th className="col-total num">Төлсөн дүн</th>
                  <th className="col-status">Төлөв</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRentals.map((r) => (
                  <tr key={r.id}>
                    <td className="col-date">
                      {r.date}
                      {r.returnDate && (
                        <div className="muted cell-sub">↩ {r.returnDate}</div>
                      )}
                    </td>
                    <td className="col-cust">
                      <span className="cell-primary">{r.cust.name}</span>
                      {r.cust.phone && (
                        <div className="muted cell-sub">{r.cust.phone}</div>
                      )}
                    </td>
                    <td className="col-items">
                      {r.items.map((i) => `${i.name}×${i.qty}`).join(", ")}
                    </td>
                    <td className="col-dur">
                      {r.durLabel}
                      <div className="muted cell-sub">{r.modeLabel}</div>
                    </td>
                    <td className="col-total num price">{fmt(r.total)}</td>
                    <td className="col-status">
                      {r.status === "out" ? (
                        <span className="chip out">Гарсан</span>
                      ) : (
                        <span className="chip in">Ирсэн</span>
                      )}
                    </td>
                    <td className="col-actions">
                      <div className="actions-row">
                        <button
                          type="button"
                          className="btn sm ghost"
                          onClick={() => generateContractPdf(r)}
                        >
                          PDF
                        </button>
                        {r.status === "out" && (
                          <button
                            type="button"
                            className="btn sm warn"
                            onClick={() => onReturn(r.id)}
                          >
                            Ирсэн
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn sm danger ghost"
                          disabled={busy}
                          title="Устгах"
                          onClick={() => onDeleteRental(r.id)}
                        >
                          Устгах
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatActivityTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace("T", " ");
  const date = d.toLocaleDateString("sv-SE");
  const time = d.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}
