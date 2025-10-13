# AI-Powered MES Challenge Chatbot

An intelligent chatbot with Retrieval-Augmented Generation (RAG) capabilities for the Minnesota MES Modernization Challenge website.

## Features

- **Smart Q&A**: Answers questions about the MES Challenge using RAG to ensure accurate, grounded responses
- **Floating Widget**: Convenient chat widget accessible from any page
- **Full-Page Interface**: Dedicated chatbot page with conversation history
- **Admin Dashboard**: Manage knowledge base and view analytics
- **Source Citations**: Every response includes links to source pages
- **Feedback System**: Users can rate responses to improve quality
- **Conversation History**: Save and revisit past conversations

## Setup Instructions

### 1. Add Your OpenAI API Key

Edit the `.env` file and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

You can get an API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### 2. Initialize the Knowledge Base

The chatbot needs to be seeded with website content before it can answer questions:

1. Make sure your OpenAI API key is configured
2. Navigate to the admin login page: `http://localhost:5173/admin/login`
3. Log in with the default password: `admin123`
4. Click "Seed/Re-index Knowledge Base" button
5. Wait for the process to complete (it will extract and embed all website content)

The seeding process:
- Extracts content from all pages (Home, Great Bake Off, FAQs, MES Training, etc.)
- Splits content into optimized chunks for semantic search
- Generates embeddings using OpenAI's text-embedding-3-small model
- Stores everything in Supabase with vector indexes for fast retrieval

### 3. Start Using the Chatbot

After seeding, the chatbot is ready to use:

**Floating Widget**:
- Available on all pages (except admin and chatbot pages)
- Click the blue chat icon in the bottom-right corner
- Ask questions and get instant answers

**Full-Page Interface**:
- Navigate to `/chatbot` or click "AI Assistant" in the header
- Larger interface with conversation history sidebar
- Save and manage multiple conversations

### 4. Admin Dashboard

Access the admin dashboard at `/admin` to:

- **Knowledge Base Management**:
  - View total chunks and pages indexed
  - Re-index content when pages are updated
  - See chunk distribution across pages

- **Analytics**:
  - Total conversations and messages
  - Positive and negative feedback counts
  - Satisfaction rate

## How It Works

The chatbot uses Retrieval-Augmented Generation (RAG):

1. **User asks a question**: "What is the Great Bake Off?"

2. **Query embedding**: The question is converted to a vector using OpenAI embeddings

3. **Semantic search**: Vector similarity search finds the most relevant content chunks

4. **Context assembly**: Top 5-7 chunks are combined with the user's query

5. **Response generation**: OpenAI GPT-4o-mini generates an answer based only on the retrieved context

6. **Source citations**: The response includes links to the source pages

This ensures the chatbot never hallucinates - it only answers based on your website content.

## Configuration

### Environment Variables

```env
# Required: OpenAI API key for embeddings and chat
VITE_OPENAI_API_KEY=your-openai-api-key

# Optional: Admin password (default: admin123)
VITE_ADMIN_PASSWORD=your-secure-password

# Already configured: Supabase connection
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Changing Admin Password

1. Log into the admin dashboard
2. Go to Settings (future feature) or manually update via Supabase
3. The password is hashed using bcrypt for security

## Database Schema

The chatbot uses these Supabase tables:

- **document_chunks**: Stores text chunks with embeddings
- **conversations**: Tracks user conversation sessions
- **messages**: Individual chat messages
- **chat_feedback**: User feedback on responses
- **admin_config**: Admin configuration and password

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Usage Tips

### For Users

**Asking Questions**:
- Be specific: "What are the evaluation criteria for slice submissions?"
- Reference specific topics: "Tell me about Step 2 of the Bake Off"
- Ask for clarification: "What's the difference between a slice and a layer?"

**Using Citations**:
- Click source links to navigate to the original page
- Citations show which pages informed the answer

**Feedback**:
- Thumbs up for helpful responses
- Thumbs down for incorrect or unhelpful answers (helps improve the bot)

### For Administrators

**When to Re-index**:
- After updating page content
- After adding new pages
- If answers seem outdated

**Monitoring**:
- Check analytics regularly to see usage patterns
- Review negative feedback to identify content gaps
- Monitor chunk distribution to ensure all pages are indexed

## Troubleshooting

### Chatbot Not Responding

1. Check OpenAI API key is set correctly in `.env`
2. Verify knowledge base is seeded (check admin dashboard)
3. Check browser console for errors
4. Ensure Supabase connection is working

### Inaccurate Answers

1. Re-index the knowledge base
2. Check if the relevant content exists on the website
3. Consider adding more detailed content to pages

### Seeding Fails

1. Verify OpenAI API key is valid
2. Check you have API credits
3. Check network connection
4. Review browser console for specific errors

## API Costs

The chatbot uses OpenAI APIs:

- **Embeddings** (text-embedding-3-small): ~$0.00002 per 1K tokens
- **Chat** (gpt-4o-mini): ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens

Estimated costs:
- Initial seeding: ~$0.50-2.00 (one-time, depends on content volume)
- Per conversation (5-10 messages): ~$0.01-0.05
- Monthly cost for 1000 conversations: ~$10-50

The chatbot implements local caching to reduce costs.

## Support

For issues or questions about the chatbot:
1. Check this README
2. Review browser console for errors
3. Check admin dashboard analytics
4. Contact the development team

## Future Enhancements

Potential improvements:
- Document upload via admin dashboard
- Advanced analytics and reporting
- Conversation search
- Multi-language support
- Voice input/output
- Integration with external knowledge sources
