import { collection, getDocs, Firestore, DocumentData } from 'firebase/firestore';
import * as XLSX from 'xlsx';

/**
 * Fetches all documents from a specified collection.
 * @param firestore The Firestore instance.
 * @param collectionName The name of the collection to fetch.
 * @returns A promise that resolves to an array of document data.
 */
async function fetchCollectionData(firestore: Firestore, collectionName: string): Promise<DocumentData[]> {
    const collectionRef = collection(firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        console.warn(`No documents found in collection: ${collectionName}`);
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Converts an array of objects to a an Excel worksheet.
 * @param data The array of objects to convert.
 * @returns An XLSX worksheet.
 */
function toWorkSheet(data: DocumentData[]): XLSX.WorkSheet {
    // Sanitize data for Excel
    const sanitizedData = data.map(item => {
        const newItem: { [key: string]: any } = {};
        for (const key in item) {
            const value = item[key];
            if (value && typeof value === 'object' && value.seconds) {
                // Convert Firestore Timestamps to ISO strings
                newItem[key] = new Date(value.seconds * 1000).toISOString();
            } else if (Array.isArray(value) || (value && typeof value === 'object')) {
                // Stringify other objects/arrays
                newItem[key] = JSON.stringify(value);
            } else {
                newItem[key] = value;
            }
        }
        return newItem;
    });

    return XLSX.utils.json_to_sheet(sanitizedData);
}

/**
 * Fetches data from specified Firestore collections and exports it to an Excel file.
 * @param firestore The Firestore instance.
 * @param collectionsToExport An array of collection names to be exported.
 * @returns A promise that resolves to true if the file was created, false otherwise.
 */
export async function exportDataToExcel(firestore: Firestore, collectionsToExport: string[]): Promise<boolean> {
    const workbook = XLSX.utils.book_new();

    for (const collectionName of collectionsToExport) {
        try {
            const data = await fetchCollectionData(firestore, collectionName);
            if (data.length > 0) {
                const worksheet = toWorkSheet(data);
                // Sheet names are limited to 31 chars
                const sheetName = collectionName.replace(/_/g, ' ').substring(0, 31);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }
        } catch (error) {
            console.error(`Error fetching data for collection ${collectionName}:`, error);
            // Optionally create a sheet with error info
            const errorSheet = XLSX.utils.aoa_to_sheet([
                ["Error"],
                [`Failed to fetch data for ${collectionName}`],
                [JSON.stringify(error)]
            ]);
            XLSX.utils.book_append_sheet(workbook, errorSheet, `Error ${collectionName.substring(0, 24)}`);
        }
    }

    // Check if the workbook has any sheets before attempting to write the file.
    if (workbook.SheetNames.length === 0) {
        return false; // Indicate that no file was generated.
    }

    // Generate and download the Excel file
    XLSX.writeFile(workbook, `ProSeed_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true; // Indicate success.
}

/**
 * Exports a given JSON/object array directly to an Excel file.
 * @param jsonData The array of objects to export.
 * @param sheetName The name for the worksheet.
 * @param fileName The base name for the downloaded file.
 * @returns True if the file was created, false otherwise.
 */
export function exportJsonToExcel(jsonData: DocumentData[], sheetName: string, fileName?: string): boolean {
    if (!jsonData || jsonData.length === 0) {
        return false;
    }
    
    const workbook = XLSX.utils.book_new();
    const worksheet = toWorkSheet(jsonData);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

    const finalFileName = fileName ? `${fileName}.xlsx` : `ProSeed_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, finalFileName);
    return true;
}
