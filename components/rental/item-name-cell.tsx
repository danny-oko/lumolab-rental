import { ItemEmoji } from "@/components/rental/inv-icon-input";
import type { InventoryItem } from "@/lib/rental/types";

type ItemNameCellProps = {
  item: InventoryItem;
  variant: "inventory" | "rental";
};

export function ItemNameCell({ item, variant }: ItemNameCellProps) {
  return (
    <span className="item-name">
      <span className="item-name__icon">
        <ItemEmoji icon={item.icon} size={26} />
      </span>
      <span className="item-name__text">{item.name}</span>
      {variant === "inventory" && item.isStand && item.noFree && (
        <span className="badge">үнэгүй биш</span>
      )}
      {variant === "inventory" && item.isStand && !item.noFree && (
        <span className="badge">гэрэлд үнэгүй</span>
      )}
      {variant === "rental" && item.cat === "ГЭРЭЛ" && !item.noStand && (
        <span className="badge">+стенд</span>
      )}
      {variant === "rental" && item.isStand && item.noFree && (
        <span className="badge">үнэгүй биш</span>
      )}
    </span>
  );
}
