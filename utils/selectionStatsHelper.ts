import { collection, getDocs } from "firebase/firestore";

export async function calculateSelectionStats(db: any, selectedBrand: string) {
  try {
    const selectionsSnapshot = await getDocs(collection(db, "brandSelections"));
    const totalSelections: Record<string, number> = {};
    let totalCount = 0;

    selectionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.brand === selectedBrand) {
        totalSelections[data.attribute] = (totalSelections[data.attribute] || 0) + 1;
        totalCount++;
      }
    });

    return { totalSelections, totalCount };
  } catch (err) {
    console.error("Error fetching selection statistics:", err);
    return { totalSelections: {}, totalCount: 0 };
  }
}