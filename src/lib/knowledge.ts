import fs from 'fs';
import path from 'path';

/**
 * Loads metabolic research from the knowledge vault.
 * Falls back to a specific constitution if the requested one doesn't exist.
 */
export async function getKnowledgeItem(category: 'constitutions' | 'specialists', slug: string): Promise<string> {
    try {
        const knowledgeDir = path.join(process.cwd(), 'src', 'knowledge', category);
        const filePath = path.join(knowledgeDir, `${slug.toLowerCase()}.md`);

        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }

        return '';
    } catch (error) {
        console.error(`Error loading knowledge item: ${category}/${slug}`, error);
        return '';
    }
}
