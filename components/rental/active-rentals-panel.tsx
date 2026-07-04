import { generateContractPdf } from "@/lib/pdf/generate-contract";
import { fmt } from "@/lib/rental/constants";
import type { RentalRecord } from "@/lib/rental/types";

type ActiveRentalsPanelProps = {
  rentals: RentalRecord[];
  onReturn: (id: string) => void;
};

export function ActiveRentalsPanel({
  rentals,
  onReturn,
}: ActiveRentalsPanelProps) {
  return (
    <div className="panel">
      <strong>Түрээсийн бүртгэл</strong>
      {rentals.length === 0 ? (
        <div className="empty-state">
          Одоогоор түрээс байхгүй. &quot;Шинэ түрээс&quot; табаас үүсгэнэ үү.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table-active">
            <thead>
              <tr>
                <th>#</th>
                <th>Огноо</th>
                <th>Түрээслэгч</th>
                <th>Бараа</th>
                <th>Хугацаа</th>
                <th className="num">Төлсөн дүн</th>
                <th>Төлөв</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id}>
                  <td className="small">{r.id}</td>
                  <td className="small">
                    {r.date}
                    {r.returnDate && (
                      <div className="muted">↩ {r.returnDate}</div>
                    )}
                  </td>
                  <td>
                    {r.cust.name}
                    {r.cust.phone && (
                      <div className="muted small">{r.cust.phone}</div>
                    )}
                  </td>
                  <td className="small">{r.items.map((i) => `${i.name}×${i.qty}`).join(", ")}</td>
                  <td className="small">
                    {r.durLabel}
                    <div className="muted">{r.modeLabel}</div>
                  </td>
                  <td className="num price">{fmt(r.total)}</td>
                  <td>
                    {r.status === "out" ? (
                      <span className="chip out">Гарсан</span>
                    ) : (
                      <span className="chip in">Ирсэн</span>
                    )}
                  </td>
                  <td>
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
