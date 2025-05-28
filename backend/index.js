// backend/index.js
import dotenv from 'dotenv'; // Import dotenv first
dotenv.config(); // CALL DOTENV.CONFIG() IMMEDIATELY AFTER IMPORTING IT
console.log('Environment Variables Loaded. SUPABASE_JWT_SECRET (from index.js):', process.env.SUPABASE_JWT_SECRET ? process.env.SUPABASE_JWT_SECRET.substring(0, 10) + '...' : 'NOT LOADED');
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import authMiddleware from './auth.js'; // auth.js will now have SUPABASE_JWT_SECRET available

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client using the Service Role Key (for secure server-side operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseJwtSecretForAuth = process.env.SUPABASE_JWT_SECRET; // This should now be correctly loaded
const reactAppFrontendUrl = process.env.REACT_APP_FRONTEND_URL; // Used for CORS origin

// Critical check: Ensure all necessary environment variables are loaded
if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseJwtSecretForAuth) {
    console.error('CRITICAL ERROR: Supabase URL, Service Role Key, or JWT Secret is missing in .env file.');
    console.error('Please ensure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_JWT_SECRET are correctly set in your backend/.env file.');
    process.exit(1); // Exit the process if critical env variables are missing
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- Middleware ---
app.use(cors({
    origin: reactAppFrontendUrl || 'http://localhost:3000', // Allow requests from your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // Enable parsing of JSON request bodies

// --- Basic test route ---
app.get('/', (req, res) => {
    res.send('Mind Map Backend is running!');
});


app.get('/api/test-db-connection', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mindmaps')
            .select('id') 
            .limit(1);

        if (error) {
            console.error('Test DB Connection Error:', error);
            return res.status(500).json({
                message: 'Failed to query Supabase using Service Role Key. Check table name or RLS if enabled for SRK (unlikely).',
                error: error.message
            });
        }

        console.log('Backend Console: Test DB Connection Success! Data received:', data);
        res.status(200).json({
            message: 'Supabase connection successful via Service Role Key! (Table "mindmaps" accessible)',
            data: data
        });

    } catch (e) {
        console.error('Backend Console: Unexpected error during DB connection test:', e);
        res.status(500).json({ message: 'An unexpected error occurred during DB connection test.', error: e.message });
    }
});

app.post('/api/mindmaps', authMiddleware, async (req, res) => {

    const userId = req.userId;
    const { mindmapId, name, nodes_data, connections_data, translate_x, translate_y } = req.body;

    console.log('Backend /api/mindmaps POST: Received request for User ID:', userId);
    console.log('Backend /api/mindmaps POST: mindmapId:', mindmapId);
    console.log('Backend /api/mindmaps POST: Nodes count:', nodes_data?.length);


    if (!userId || !name || !nodes_data || !connections_data) {
        console.error('Backend /api/mindmaps POST: Missing required fields for save.');
        return res.status(400).json({ error: 'Missing required fields: userId, name, nodes_data, connections_data' });
    }

    try {
        let response;
        if (mindmapId) {

            console.log('Backend /api/mindmaps POST: Attempting to UPDATE existing mind map.');
            response = await supabase
                .from('mindmaps')
                .update({ name, nodes_data, connections_data, translate_x, translate_y, updated_at: new Date() })
                .eq('id', mindmapId)
                .eq('user_id', userId) 
                .select(); 
        } else {
         
            console.log('Backend /api/mindmaps POST: Attempting to INSERT NEW mind map.');
            response = await supabase
                .from('mindmaps')
                .insert({ user_id: userId, name, nodes_data, connections_data, translate_x, translate_y })
                .select(); 
        }

        if (response.error) {
            console.error('Backend /api/mindmaps POST: Supabase DB operation error:', response.error);
            return res.status(500).json({ error: response.error.message });
        }

        console.log('Backend /api/mindmaps POST: Supabase DB operation successful. Data:', response.data);
        res.status(200).json({ message: 'Mind map saved successfully!', data: response.data[0] });

    } catch (error) {
        console.error('Backend /api/mindmaps POST: Server error caught:', error);
        res.status(500).json({ error: 'Failed to save mind map due to server error.' });
    }
});


app.get('/api/mindmaps', authMiddleware, async (req, res) => {
    const userId = req.userId; 

    if (!userId) { 
        return res.status(401).json({ error: 'User ID not found in authentication token.' });
    }

    try {
        const { data, error } = await supabase
            .from('mindmaps')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false }) 
            .limit(1); 

        if (error) {
            console.error('Supabase operation error (load):', error);
            return res.status(500).json({ error: error.message });
        }

        if (data && data.length > 0) {
            res.status(200).json({ message: 'Mind map loaded successfully!', data: data[0] });
        } else {
   
            res.status(404).json({ message: 'No mind map found for this user.' });
        }

    } catch (error) {
        console.error('Server error during load:', error);
        res.status(500).json({ error: 'Failed to load mind map due to server error.' });
    }
});


app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});