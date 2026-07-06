import { EquipmentPicker } from "@/components/rental/equipment-picker";
import { OrderCart } from "@/components/rental/order-cart";
import type { RentalAppState } from "@/components/rental/use-rental-app";

type RentalPanelProps = Pick<
  RentalAppState,
  | "inv"
  | "filteredInv"
  | "cart"
  | "catFilter"
  | "durMult"
  | "avail"
  | "setCatFilter"
  | "setQty"
  | "lines"
  | "days"
  | "durLabel"
  | "longDiscount"
  | "priceMode"
  | "freeEntitlement"
  | "freeShort"
  | "grossDur"
  | "discountAmt"
  | "base"
  | "addVat"
  | "vatAmt"
  | "charged"
  | "employeeDiscount"
  | "employeeDiscountAmt"
  | "cust"
  | "setDays"
  | "setPriceMode"
  | "setEmployeeDiscount"
  | "setCust"
  | "checkout"
>;

export function RentalPanel(props: RentalPanelProps) {
  const {
    inv,
    filteredInv,
    cart,
    catFilter,
    durMult,
    avail,
    setCatFilter,
    setQty,
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
    employeeDiscount,
    employeeDiscountAmt,
    cust,
    setDays,
    setPriceMode,
    setEmployeeDiscount,
    setCust,
    checkout,
  } = props;

  return (
    <div className="rental-layout">
      <EquipmentPicker
        inv={inv}
        filteredInv={filteredInv}
        cart={cart}
        catFilter={catFilter}
        durMult={durMult}
        avail={avail}
        onFilterChange={setCatFilter}
        onSetQty={setQty}
      />
      <OrderCart
        lines={lines}
        days={days}
        durLabel={durLabel}
        longDiscount={longDiscount}
        priceMode={priceMode}
        freeEntitlement={freeEntitlement}
        freeShort={freeShort}
        grossDur={grossDur}
        discountAmt={discountAmt}
        base={base}
        addVat={addVat}
        vatAmt={vatAmt}
        charged={charged}
        employeeDiscount={employeeDiscount}
        employeeDiscountAmt={employeeDiscountAmt}
        durMult={durMult}
        cust={cust}
        onDaysChange={setDays}
        onPriceModeChange={setPriceMode}
        onEmployeeDiscountChange={setEmployeeDiscount}
        onCustChange={setCust}
        onCheckout={checkout}
      />
    </div>
  );
}
