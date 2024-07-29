import { promises as fs } from 'fs';
import path from 'path';

const leaderboardFilePath = path.join(process.cwd(), 'data', 'leaderboard.json');

async function initializeLeaderboard() {
    try {
        await fs.access(leaderboardFilePath);
    } catch (err) {
        await fs.writeFile(leaderboardFilePath, JSON.stringify([]));
    }
}

export default async function handler(req, res) {
    await initializeLeaderboard(); // Ensure file is initialized

    switch (req.method) {
        case 'GET':
            try {
                const data = await fs.readFile(leaderboardFilePath, 'utf-8');
                res.status(200).json(JSON.parse(data));
            } catch (err) {
                res.status(500).json({ error: 'Failed to read leaderboard data' });
            }
            break;
        case 'POST':
            try {
                const newEntry = req.body;
                const data = JSON.parse(await fs.readFile(leaderboardFilePath, 'utf-8'));
                data.push(newEntry);
                data.sort((a, b) => a.totalMilliseconds - b.totalMilliseconds);
                await fs.writeFile(leaderboardFilePath, JSON.stringify(data, null, 2));
                res.status(200).json(newEntry);
            } catch (err) {
                res.status(500).json({ error: 'Failed to save leaderboard data' });
            }
            break;
        case 'DELETE':
            try {
                const { index } = req.body;
                const data = JSON.parse(await fs.readFile(leaderboardFilePath, 'utf-8'));
                data.splice(index, 1);
                await fs.writeFile(leaderboardFilePath, JSON.stringify(data, null, 2));
                res.status(200).json({ success: true });
            } catch (err) {
                res.status(500).json({ error: 'Failed to remove leaderboard entry' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
