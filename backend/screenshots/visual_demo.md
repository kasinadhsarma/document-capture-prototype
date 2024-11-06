=== Visual Documentation ===
## 1. Sample Passport
```
File: uploads/sample_passport.jpg
Source: https://www.doubango.org/webapps/mrz/img/sample2_highres.jpg
Size: 275K
```

## 2. Code Execution
```bash
$ curl -X POST -F "document=@uploads/sample_passport.jpg" http://localhost:3001/api/documents/extract
```

## 3. Extraction Results
```json
{
    "name": "SPECIMEN",
    "documentNumber": "99006000",
    "expirationDate": "06.09.2016"
}
```

## 4. Implementation Details
- Backend: Node.js with TypeScript
- OCR Engine: Tesseract.js
- MRZ Parser: mrz package
- Document Fields:
  * Name: Successfully extracted
  * Document Number: Successfully extracted
  * Expiration Date: Successfully extracted

## 5. Code Structure
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
