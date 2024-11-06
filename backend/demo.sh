echo '=== Document Capture Prototype Demo ==='
echo '1. Sample Passport:'
ls -l uploads/sample_passport.jpg
echo -e '\n2. Processing Document...'
curl -X POST -F "document=@uploads/sample_passport.jpg" http://localhost:3001/api/documents/extract | python3 -m json.tool
