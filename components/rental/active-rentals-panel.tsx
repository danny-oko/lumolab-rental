"use client";

import { generateContractPdf } from "@/lib/pdf/generate-contract";
import { fmt } from "@/lib/rental/constants";
import type { RentalHistoryFilter, RentalRecord } from "@/lib/rental/types";

type ActiveRentalsPanelProps = {
  rentals: RentalRecord[];
  filteredRentals: RentalRecord[];
  rentalFilter: RentalHistoryFilter;
  busy?: boolean;
  onFilterChange: (filter: RentalHistoryFilter) => void;
  onReturn: (id: string) => void;
  onDeleteRental: (id: string) => void;
  onDeleteAllRentals: () => void;
};

const FILTER_OPTIONS: { id: RentalHistoryFilter; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "out", label: "Идэвхтэй" },
  { id: "in", label: "Буцаасан" },
];

export function ActiveRentalsPanel({
  rentals,
  filteredRentals,
  rentalFilter,
  busy = false,
  onFilterChange,
  onReturn,
  onDeleteRental,
  onDeleteAllRentals,
}: ActiveRentalsPanelProps) {
  const activeCount = rentals.filter((r) => r.status === "out").length;
  const returnedCount = rentals.filter((r) => r.status === "in").length;

  return (
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
          <div
            className="filter-pills"
            role="tablist"
            aria-label="Түрээс шүүлтүүр"
          >
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
                <th className="col-status-actions">Төлөв</th>
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
                  <td className="col-status-actions">
                    <div className="status-actions-row">
                      {r.status === "out" ? (
                        <span className="chip out">Гарсан</span>
                      ) : (
                        <span className="chip in">Ирсэн</span>
                      )}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
