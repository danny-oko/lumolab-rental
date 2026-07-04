type StatsBarProps = {
  totalSku: number;
  availableTotal: number;
  outTotal: number;
  activeRentals: number;
  standsAvail: number;
};

export function StatsBar({
  totalSku,
  availableTotal,
  outTotal,
  activeRentals,
  standsAvail,
}: StatsBarProps) {
  return (
    <div className="stats-row">
      <div className="stat">
        <div className="v">{totalSku}</div>
        <div className="l">Нэр төрөл</div>
      </div>
      <div className="stat">
        <div className="v ok">{availableTotal}</div>
        <div className="l">Агуулахад бэлэн</div>
      </div>
      <div className="stat">
        <div className="v danger">{outTotal}</div>
        <div className="l">Гарсан нэгж</div>
      </div>
      <div className="stat">
        <div className="v warn">{activeRentals}</div>
        <div className="l">Идэвхтэй түрээс</div>
      </div>
      <div className="stat">
        <div className="v">{standsAvail}</div>
        <div className="l">Бэлэн стенд</div>
      </div>
    </div>
  );
}
