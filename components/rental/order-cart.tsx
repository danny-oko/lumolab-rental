import { fmt } from "@/lib/rental/constants";
import type { CartLine, Customer, PriceMode } from "@/lib/rental/types";

type OrderCartProps = {
  lines: CartLine[];
  days: number;
  durLabel: string;
  longDiscount: number;
  priceMode: PriceMode;
  freeEntitlement: number;
  freeShort: number;
  grossDur: number;
  discountAmt: number;
  base: number;
  addVat: boolean;
  vatAmt: number;
  charged: number;
  durMult: number;
  cust: Customer;
  onDaysChange: (days: number) => void;
  onPriceModeChange: (mode: PriceMode) => void;
  onCustChange: (cust: Customer) => void;
  onCheckout: () => void;
};

export function OrderCart({
  lines,
  days,
  durLabel,
  longDiscount,
  priceMode,
  freeEntitlement,
  freeShort,
  grossDur,
  discountAmt,
  base,
  addVat,
  vatAmt,
  charged,
  durMult,
  cust,
  onDaysChange,
  onPriceModeChange,
  onCustChange,
  onCheckout,
}: OrderCartProps) {
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="rental-pane rental-cart panel">
      <div className="rental-cart__head">
        <strong className="rental-cart__title">Захиалга</strong>
        {itemCount > 0 && (
          <span className="rental-cart__badge">{itemCount} ширхэг</span>
        )}
      </div>

      <div className="rental-cart__body">
        <div className="rental-cart__options">
          <div className="rental-cart__option">
            <label>Хугацаа — {durLabel}</label>
            <div className="seg">
              <button
                type="button"
                className={days === 0.5 ? "on" : ""}
                onClick={() => onDaysChange(0.5)}
              >
                12 цаг
              </button>
              <button
                type="button"
                className={days === 1 ? "on" : ""}
                onClick={() => onDaysChange(1)}
              >
                24 цаг
                <span className="seg-hint">1 өдөр</span>
              </button>
              <button
                type="button"
                className={days >= 2 ? "on" : ""}
                onClick={() => onDaysChange(days >= 2 ? days : 2)}
              >
                Олон
                <span className="seg-hint">өдөр</span>
              </button>
            </div>
            {days >= 2 && (
              <>
                <input
                  type="range"
                  min={2}
                  max={14}
                  step={1}
                  value={days}
                  onChange={(e) => onDaysChange(+e.target.value)}
                />
                <div className="range-labels">
                  <span className="small muted">2 өдөр</span>
                  <span className="small">
                    <strong>{days} өдөр</strong>
                    {days >= 4 && <span className="ok"> −10%</span>}
                  </span>
                  <span className="small muted">14 өдөр</span>
                </div>
              </>
            )}
          </div>

          <div className="rental-cart__option">
            <label>НӨАТ</label>
            <div className="seg seg--2">
              <button
                type="button"
                className={priceMode === "base" ? "on" : ""}
                onClick={() => onPriceModeChange("base")}
              >
                НӨАТ-гүй
                <span className="seg-hint">суурь үнэ</span>
              </button>
              <button
                type="button"
                className={priceMode === "vat" ? "on" : ""}
                onClick={() => onPriceModeChange("vat")}
              >
                НӨАТ +10%
              </button>
            </div>
          </div>
        </div>

        {freeEntitlement > 0 && (
          <div className="standnote">
            {freeShort > 0
              ? `⚠ ${freeShort} үнэгүй стенд бэлэн алга (Combo үнэгүй биш).`
              : `✓ ${freeEntitlement} стенд гэрэлтэй ₮0-р дагалдана.`}
          </div>
        )}

        <div className="rental-cart__lines">
          {lines.length === 0 ? (
            <div className="empty-state">Бараа сонгоогүй байна.</div>
          ) : (
            lines.map((l) => (
              <div className="cartline" key={l.id}>
                <span>
                  {l.name}
                  {l.freeStand && <span className="badge">гэрэлтэй ₮0</span>}
                  {" ×"}
                  {l.qty}
                </span>
                <span className="price">
                  {l.unit === 0 ? (
                    <span className="ok">Үнэгүй</span>
                  ) : (
                    fmt(l.unit * l.qty * durMult)
                  )}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="rental-cart__totals">
          <div className="cartline">
            <span className="muted">Дэд дүн ({durLabel})</span>
            <span className="price">{fmt(grossDur)}</span>
          </div>
          {longDiscount > 0 && (
            <div className="cartline">
              <span className="muted">Урт хугацааны хямдрал</span>
              <span className="price ok">−{fmt(discountAmt)}</span>
            </div>
          )}
          <div className="cartline">
            <span className="muted">НӨАТ-гүй дүн</span>
            <span className="price">{fmt(base)}</span>
          </div>
          {addVat && (
            <div className="cartline">
              <span className="muted">НӨАТ (10%)</span>
              <span className="price">+{fmt(vatAmt)}</span>
            </div>
          )}
          <div className="cartline cartline--grand">
            <span>Нийт төлөх</span>
            <span className="total">{fmt(charged)}</span>
          </div>
        </div>
      </div>

      <div className="rental-cart__customer">
        <label>
          Түрээслэгчийн мэдээлэл{" "}
          <span className="danger">*Нэр заавал</span>
        </label>
        <div className="stack">
          <input
            type="text"
            placeholder="Нэр (заавал)"
            value={cust.name}
            onChange={(e) => onCustChange({ ...cust, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Утас"
            value={cust.phone}
            onChange={(e) => onCustChange({ ...cust, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Регистр / РД"
            value={cust.reg}
            onChange={(e) => onCustChange({ ...cust, reg: e.target.value })}
          />
          <input
            type="text"
            placeholder="Хаяг"
            value={cust.addr}
            onChange={(e) => onCustChange({ ...cust, addr: e.target.value })}
          />
        </div>
        <button type="button" className="btn block" onClick={onCheckout}>
          Төлбөр баталгаажуулж гэрээ үүсгэх
        </button>
        {(lines.length === 0 || !cust.name) && (
          <p className="alert danger">
            {lines.length === 0
              ? "⚠ Эхлээд бараа сонгоно уу."
              : "⚠ Түрээслэгчийн нэрийг бөглөнө үү."}
          </p>
        )}
        <p className="hint">
          Гэрээ үүсгэснээр Түүх рүү нэмэгдэж, PDF татах боломжтой болно.
        </p>
      </div>
    </div>
  );
}
