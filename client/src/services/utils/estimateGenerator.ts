import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ProjectData {
  name: string;
  description: string;
  images: Array<{ id: string; filename: string }>;
  estimate: {
    items: Array<{
      name: string;
      quantity: number;
      unit: string;
      price: number;
      total: number;
      costType: "MATERIAL" | "LABOR";
    }>;
    laborCost: number;
    totalCost: number;
  };
}

export const generateEstimatePDF = async (
  project: ProjectData,
): Promise<Blob> => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Смета проекта", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text(project.name, 20, 40);

  doc.setFontSize(10);
  doc.text(
    `Дата: ${format(new Date(), "dd MMMM yyyy", { locale: ru })}`,
    20,
    50,
  );

  if (project.description) {
    doc.text("Описание:", 20, 60);
    const descriptionLines = doc.splitTextToSize(project.description, 170);
    doc.text(descriptionLines, 20, 70);
  }

  const tableData = project.estimate.items.map((item, index) => [
    index + 1,
    item.name,
    item.quantity.toString(),
    item.unit,
    item.price.toLocaleString() + " ₽",
    item.total.toLocaleString() + " ₽",
    item.costType === "LABOR" ? "Работа" : "Материал",
  ]);

  if (project.estimate.laborCost > 0) {
    tableData.push([
      "",
      "Стоимость работ",
      "",
      "",
      project.estimate.laborCost.toLocaleString() + " ₽",
      project.estimate.laborCost.toLocaleString() + " ₽",
      "Работа",
    ]);
  }

  (doc as any).autoTable({
    startY: project.description ? 90 : 70,
    head: [["№", "Наименование", "Кол-во", "Ед.", "Цена", "Сумма", "Тип"]],
    body: tableData,
    foot: [
      [
        "",
        "ИТОГО:",
        "",
        "",
        "",
        project.estimate.totalCost.toLocaleString() + " ₽",
        "",
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  doc.text("____________________", 20, finalY + 20);
  doc.text("Подпись заказчика", 20, finalY + 30);

  doc.text("____________________", 120, finalY + 20);
  doc.text("Подпись исполнителя", 120, finalY + 30);

  return doc.output("blob");
};
