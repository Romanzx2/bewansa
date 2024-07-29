import { writeFile, readFile, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const leaderboardDir = resolve(process.cwd(), 'data');
const leaderboardPath = join(leaderboardDir, 'leaderboard.json');

if (!existsSync(leaderboardDir)) {
    mkdirSync(leaderboardDir, { recursive: true });
}

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                if (!existsSync(leaderboardPath)) {
                    await writeFile(leaderboardPath, JSON.stringify([]));
                }
                const data = await readFile(leaderboardPath, 'utf-8');
                res.status(200).json(JSON.parse(data));
            } catch (err) {
                res.status(500).json({ error: 'Failed to read leaderboard data' });
            }
            break;
        case 'POST':
            try {
                const newEntry = req.body;
                let data = [];
                if (existsSync(leaderboardPath)) {
                    data = JSON.parse(await readFile(leaderboardPath, 'utf-8'));
                }
                data.push(newEntry);
                data.sort((a, b) => a.totalMilliseconds - b.totalMilliseconds);
                await writeFile(leaderboardPath, JSON.stringify(data, null, 2));
                res.status(200).json(newEntry);
            } catch (err) {
                res.status(500).json({ error: 'Failed to save leaderboard data' });
            }
            break;
        case 'DELETE':
            try {
                const { index } = req.body;
                if (!existsSync(leaderboardPath)) {
                    return res.status(404).json({ error: 'Leaderboard not found' });
                }
                let data = JSON.parse(await readFile(leaderboardPath, 'utf-8'));
                data.splice(index, 1);
                await writeFile(leaderboardPath, JSON.stringify(data, null, 2));
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
