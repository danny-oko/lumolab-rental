import type { RentalRecord } from "@/lib/rental/types";
import { NOTO_BOLD, NOTO_REG } from "@/lib/pdf/fonts";

let fontsReady = false;

function ensureFonts(doc: {
  addFileToVFS: (name: string, data: string) => void;
  addFont: (file: string, family: string, style: string) => void;
}) {
  if (!fontsReady) {
    doc.addFileToVFS("Noto-Regular.ttf", NOTO_REG);
    doc.addFont("Noto-Regular.ttf", "Noto", "normal");
    doc.addFileToVFS("Noto-Bold.ttf", NOTO_BOLD);
    doc.addFont("Noto-Bold.ttf", "Noto", "bold");
    fontsReady = true;
  }
}

const fmtP = (n: number) => "₮" + Math.round(n).toLocaleString("en-US");

export async function generateContractPdf(rec: RentalRecord) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  ensureFonts(doc);

  const W = 210;
  const M = 16;
  const R = W - M;
  let y = 18;
  const F = (s: "normal" | "bold", sz: number) => {
    doc.setFont("Noto", s);
    doc.setFontSize(sz);
  };

  F("bold", 15);
  doc.text("Lumo Lab LLC", M, y);
  F("normal", 10.5);
  doc.text("Тоног төхөөрөмжийн түрээсийн гэрээ", R, y, { align: "right" });
  y += 3;
  doc.setDrawColor(60);
  doc.setLineWidth(0.3);
  doc.line(M, y, R, y);
  y += 7;

  F("normal", 9.5);
  doc.text(`Гэрээний дугаар: ${rec.id}`, M, y);
  doc.text(`Огноо: ${rec.date}`, R, y, { align: "right" });
  y += 8;

  F("bold", 10);
  doc.text("Түрээслэгчийн мэдээлэл", M, y);
  y += 5.5;
  F("normal", 9.5);
  const c = rec.cust;
  doc.text(`Нэр: ${c.name || "-"}`, M, y);
  doc.text(`Утас: ${c.phone || "-"}`, 110, y);
  y += 5;
  doc.text(`Регистрийн дугаар: ${c.reg || "-"}`, M, y);
  doc.text(`Хаяг: ${c.addr || "-"}`, 110, y);
  y += 8;

  F("bold", 10);
  doc.text("Түрээслүүлсэн тоног төхөөрөмж", M, y);
  y += 5;
  const cQty = 120;
  const cUnit = 160;
  const cSum = R - 1;
  doc.setFillColor(238, 238, 238);
  doc.rect(M, y - 4, R - M, 6.5, "F");
  F("bold", 8.5);
  doc.text("Тоног төхөөрөмж", M + 2, y);
  doc.text("Тоо", cQty, y, { align: "right" });
  doc.text("Нэгж үнэ", cUnit, y, { align: "right" });
  doc.text("Нийт", cSum, y, { align: "right" });
  y += 5.5;
  F("normal", 9);
  rec.items.forEach((it) => {
    doc.text(it.name + (it.isStand ? " *" : ""), M + 2, y);
    doc.text(String(it.qty), cQty, y, { align: "right" });
    doc.text(
      it.unit === 0 ? "Үнэгүй" : it.unit.toLocaleString("en-US"),
      cUnit,
      y,
      { align: "right" },
    );
    doc.text(
      it.unit === 0 ? "Үнэгүй" : (it.unit * it.qty).toLocaleString("en-US"),
      cSum,
      y,
      { align: "right" },
    );
    y += 5;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  });
  y += 1;
  doc.setLineWidth(0.2);
  doc.line(M, y, R, y);
  y += 6;

  F("normal", 9.5);
  doc.text(`Түрээсийн хугацаа: ${rec.durLabel}`, M, y);
  y += 5;
  doc.text(`Үнийн нөхцөл: ${rec.modeLabel}`, M, y);
  y += 6;

  const lblX = 125;
  if (rec.discount > 0) {
    doc.text("Дэд дүн:", lblX, y);
    doc.text(fmtP(rec.gross), cSum, y, { align: "right" });
    y += 5;
    doc.text("Урт хугацааны хямдрал (-10%):", lblX - 35, y);
    doc.text("-" + fmtP(rec.discount), cSum, y, { align: "right" });
    y += 5;
  }
  doc.text("НӨАТ-гүй дүн:", lblX, y);
  doc.text(fmtP(rec.base), cSum, y, { align: "right" });
  y += 5;
  if (rec.vat > 0) {
    doc.text("НӨАТ (10%):", lblX, y);
    doc.text(fmtP(rec.vat), cSum, y, { align: "right" });
    y += 5;
  }
  if (c.deposit) {
    doc.text("Барьцаа:", lblX, y);
    doc.text(fmtP(+c.deposit), cSum, y, { align: "right" });
    y += 5;
  }
  F("bold", 10.5);
  doc.text("Нийт төлбөр:", lblX, y);
  doc.text(fmtP(rec.total), cSum, y, { align: "right" });
  y += 8;

  F("bold", 9.5);
  doc.setTextColor(0);
  doc.text("Гэрээний нөхцөл ба заавар", M, y);
  y += 5;
  F("normal", 8);
  doc.setTextColor(40);
  const terms = [
    "1. Жагсаалтад заасан үнэ нь 12 цагийн түрээсийн НӨАТ-гүй суурь үнэ юм. 24 цаг (1 өдөр) болон түүнээс дээш өдрийн түрээс өдөр тутамд суурь үнийн 1.3 дахин тооцогдоно. 4 болон түүнээс дээш өдрийн түрээсэд нийт дүнгээс 10% хямдрал үзүүлнэ.",
    "2. * тэмдэгтэй гэрлийн стенд / C-stand нь гэрэл түрээслэхэд үнэгүй дагалдана (Combo stand хамаарахгүй).",
    "3. Түрээслэгч тоног төхөөрөмжийг хүлээн авах үед бүрэн бүтэн байдлыг шалгаж хүлээн авна. Буцаах үед анхны бүрэн бүтэн байдлаар нь хүлээлгэн өгнө.",
    "4. Эвдрэл, гэмтэл гарсан тохиолдолд засварын болон сэлбэгийн нийт зардлыг Түрээслэгч хариуцан төлнө.",
    "5. Тоног төхөөрөмж бүрэн ажиллагаагүй болсон, эсхүл алдагдсан тохиолдолд тухайн төхөөрөмжийн зах зээлийн бүрэн өртөгийг Түрээслэгч нөхөн төлнө.",
    "6. Тохиролцсон хугацаанаас хэтэрсэн тохиолдолд хоног тутамд нэмэлт түрээсийн төлбөр тооцогдоно.",
    "7. Түрээслэгч дээрх нөхцөлтэй бүрэн танилцаж, зөвшөөрсөн бөгөөд гарын үсэг зурснаар баталгаажуулав.",
  ];
  terms.forEach((t) => {
    const w = doc.splitTextToSize(t, R - M);
    doc.text(w, M, y);
    y += w.length * 3.7 + 1.8;
  });

  y = Math.max(y + 6, 266);
  doc.setTextColor(0);
  F("normal", 9.5);
  doc.setLineWidth(0.3);
  doc.line(M, y, M + 62, y);
  doc.line(R - 62, y, R, y);
  y += 5;
  doc.text("Түрээслэгч (гарын үсэг)", M, y);
  doc.text("Lumo Lab (гарын үсэг)", R - 62, y);

  doc.save(`Lumo_Lab_Geree_${rec.id}.pdf`);
}
