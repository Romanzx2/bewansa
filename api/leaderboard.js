import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const leaderboardPath = join(process.cwd(), 'data', 'leaderboard.json');

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                const data = await readFile(leaderboardPath);
                res.status(200).json(JSON.parse(data));
            } catch (err) {
                res.status(500).json({ error: 'Failed to read leaderboard data' });
            }
            break;
        case 'POST':
            try {
                const newEntry = req.body;
                let data = [];
                try {
                    data = JSON.parse(await readFile(leaderboardPath));
                } catch (err) {
                    // No data file exists yet
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
                const index = req.body.index;
                let data = JSON.parse(await readFile(leaderboardPath));
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
