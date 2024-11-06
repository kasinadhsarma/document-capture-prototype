# Document Capture Prototype Demo

## 1. Sample Document

Using a sample passport from doubango.org for testing:\n
```
-rw-rw-r-- 1 ubuntu ubuntu 280665 Nov  6 04:25 screenshots/sample_passport.jpg
```\n
## 2. Document Processing

Command used to process the document:\n
```bash
curl -X POST -F "document=@uploads/sample_passport.jpg" http://localhost:3001/api/documents/extract
```\n
## 3. Extraction Results

Successfully extracted all required fields:\n
```json
{
    "name": "SPECIMEN",
    "documentNumber": "99006000",
    "expirationDate": "06.09.2016"
}
```\n
## 4. Implementation Details

- Backend: Node.js with TypeScript
- OCR Engine: Tesseract.js for text extraction
- MRZ Parser: mrz package for passport data parsing
- Validation: All fields required (name, document number, expiration date)

## 5. Code Structure

Key components of the implementation:\n
```typescript
// DocumentProcessor.ts - Main processing class
export class DocumentProcessor {
  // OCR text extraction
  private static async extractText(imagePath: string): Promise<string>
  // Field extraction methods
  private static extractName(text: string): string | undefined
  private static extractDocumentNumber(text: string): string | undefined
  private static extractExpirationDate(text: string): string | undefined
  // Public interface
  public static async processDocument(imagePath: string): Promise<ExtractedData>
}
```
