# Search Feature Testing Guide

## ✅ OpenAI API Status
- **Status**: WORKING
- **API Key**: Configured (hardcoded fallback in `src/lib/openai.ts`)
- **Test Result**: Successfully generated 1536-dimensional embeddings
- **Model**: `text-embedding-3-small`

## 📊 Database Status
- **Total Document Chunks**: 1,195
- **Chunks with Embeddings**: 1,195 (100%)
- **Chunks without Embeddings**: 0
- **Full-Text Search**: Enabled (content_tsv column exists)
- **Vector Search Function**: `match_document_chunks` exists and working

## 🔍 How Search Works

### Search Flow
1. **User enters query** → Press ⌘K (Mac) or Ctrl+K (Windows)
2. **Generate embedding** → OpenAI creates vector representation (optional)
3. **Hybrid search**:
   - **Vector search**: Uses embeddings for semantic matching
   - **Text search**: Falls back to PostgreSQL full-text search if needed
4. **Search across**:
   - Document chunks (PDFs, uploaded docs)
   - Uploaded documents (file names)
   - Chatbot conversations
5. **Sort and rank** by relevance, date, or popularity
6. **Display results** with snippets and metadata

### Fallback Strategy
```
Try OpenAI embedding generation
  ↓ (if fails)
Use text-only search
  ↓
Search document_chunks using PostgreSQL full-text
  ↓
Search uploaded_documents by filename
  ↓
Search chatbot messages
  ↓
Combine and return results
```

## 🧪 Test Queries

Try these searches to verify everything is working:

### Test 1: MES Modernization Content
**Query**: `Minnesota MES modernization strategy`
**Expected**: Multiple results from strategy documents
**Type**: Document chunks with high relevance

### Test 2: RFP Related Content
**Query**: `RFP requirements vendor`
**Expected**: Results from RFP-related documents
**Type**: Document chunks and pages

### Test 3: Single Word
**Query**: `modernization`
**Expected**: Many results across different document types
**Type**: All types (documents, pages, conversations)

### Test 4: Specific Topic
**Query**: `action planning approach`
**Expected**: Results from planning documents
**Type**: Document chunks

### Test 5: Technical Terms
**Query**: `MMIS MAXIS WIC`
**Expected**: Results mentioning these systems
**Type**: Document chunks

## 🐛 Troubleshooting

### If search returns no results:

1. **Check browser console** (F12) for errors
   - Look for network errors
   - Check for JavaScript errors
   - Verify API calls are being made

2. **Verify you're searching properly**:
   - Open search: Click search button or press ⌘K/Ctrl+K
   - Type at least 3 characters
   - Press Enter or click a suggestion

3. **Test with simple queries first**:
   - Try: "MES"
   - Try: "strategy"
   - Try: "modernization"

4. **Check Network Tab**:
   - Should see POST requests to Supabase
   - Look for `/rest/v1/document_chunks`
   - Check response status codes

### Common Issues:

**Issue**: "No suggestions found"
- **Cause**: Autocomplete database is empty
- **Solution**: This is normal, just press Enter to search anyway

**Issue**: "No results found"
- **Cause**: Query too specific or special characters
- **Solution**: Try broader terms, remove punctuation

**Issue**: Loading forever
- **Cause**: Network or API issue
- **Solution**: Check browser console for errors

## 📝 Search Features

### Available Now:
- ✅ Global search from any page (⌘K or Ctrl+K)
- ✅ Search documents, pages, and conversations
- ✅ Hybrid vector + text search
- ✅ Search history (recent searches)
- ✅ Filter by date range
- ✅ Filter by relevance score
- ✅ Sort by relevance or date
- ✅ Click tracking and analytics
- ✅ Zero-result tracking (for content gap analysis)

### Search Types:
1. **Document Search**: Searches through PDF content chunks
2. **Upload Search**: Searches uploaded document filenames
3. **Conversation Search**: Searches chatbot conversation history
4. **Page Search**: Searches website page content

### Tabs:
- **All Results**: Shows everything
- **Documents**: PDF and document chunks only
- **Conversations**: Chatbot conversations only
- **Pages**: Website pages only

## 🎯 Expected Behavior

### Good Search Results:
- Relevance score: 60-100%
- Snippet shows matching text with query terms
- Clear source attribution
- Clickable to navigate to content

### Search Performance:
- **With embeddings**: ~1-2 seconds
- **Text-only fallback**: ~0.5-1 second
- **Large queries**: May take 2-3 seconds

## 🔧 Technical Details

### Search Service Location
`src/lib/searchService.ts`

### Key Functions:
- `performUnifiedSearch()`: Main search entry point
- `searchDocumentChunks()`: Searches PDF content
- `searchUploadedDocuments()`: Searches file names
- `searchConversations()`: Searches chat history
- `trackSearch()`: Records search analytics

### Database Tables:
- `document_chunks`: Main content (1,195 records)
- `uploaded_documents`: File metadata
- `messages`: Chatbot conversations
- `search_queries`: Search history
- `search_clicks`: Click tracking
- `popular_searches`: Trending searches

## 💡 Tips for Best Results

1. **Use natural language**: "How do I submit an RFP?"
2. **Try synonyms**: "vendor" vs "provider" vs "supplier"
3. **Be specific**: Add context words
4. **Use filters**: Date range can narrow results
5. **Check all tabs**: Content might be in different sections
6. **Try shorter queries**: Sometimes less is more

## 🎨 Design Features

The search interface matches the Minnesota DHS design system:
- **Colors**: MN Primary blue, Teal accents
- **Gradient backgrounds**: Matches homepage hero
- **Hover effects**: Smooth transitions
- **Professional**: Clean, government-appropriate styling
- **Accessible**: Keyboard navigation, proper focus states

---

**Last Updated**: Search system fully operational with 100% of documents embedded and indexed for semantic search.
