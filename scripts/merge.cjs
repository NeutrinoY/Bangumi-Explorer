const fs = require('fs');
const path = require('path');

// Allow overriding via environment variables for CI
// Default: Look for data in ../../dist/subject (for local dev) or override in CI
const SUBJECT_DIR = process.env.SUBJECT_DIR || path.join(__dirname, '../../dist/subject');
// Default: Output to ../public/db.json
const OUTPUT_FILE = process.env.OUTPUT_FILE || path.join(__dirname, '../public/db.json');

console.log(`SUBJECT_DIR: ${SUBJECT_DIR}`);
console.log(`OUTPUT_FILE: ${OUTPUT_FILE}`);

function findInfoValue(infobox, keys) {
    if (!infobox || !Array.isArray(infobox)) return null;
    for (const item of infobox) {
        if (keys.includes(item.key)) {
            if (Array.isArray(item.value)) {
                return item.value.map(v => v.v).join(' / ');
            }
            return item.value;
        }
    }
    return null;
}

function transformSubject(rawData) {
    const bgm = rawData.bangumi;
    const extra = rawData.bangumiData;
    
    if (!bgm || !bgm.id) return null;

    // 1. 宽松过滤策略
    const rank = (bgm.rating && bgm.rating.rank) ? bgm.rating.rank : (bgm.rank || 0);
    const score = bgm.rating ? bgm.rating.score : 0;
    const total = bgm.rating ? bgm.rating.total : 0;
    const collection = bgm.collection || { wish: 0, collect: 0, doing: 0, on_hold: 0, dropped: 0 };
    const watched = collection.collect || 0;

    // 严格过滤：
    // 1. 必须有有效排名 (Rank)
    // 2. 投票数 (Total) 必须 >= 50 (剔除极冷门/占位符)
    if ((!rank || rank <= 0 || rank > 99999) || total < 50) return null;

    // 2. 基础信息
    const id = bgm.id;
    const name = bgm.name;
    const cn = bgm.name_cn || name;
    const img = bgm.images ? bgm.images.common : '';
    const summary = bgm.summary || '';
    
    const date = bgm.date || bgm.air_date || '';
    const year = date ? parseInt(date.substring(0, 4)) : 0;
    // 提取月份 (1-12)，如果没有日期则为 0
    const month = date && date.length >= 7 ? parseInt(date.substring(5, 7)) : 0;
    
    const score_chart = (bgm.rating && bgm.rating.count) ? bgm.rating.count : {}; 
    
    let typeRaw = bgm.platform || 'TV';
    let type = 'TV';
    
    // Normalize types to: TV, Movie, OVA, Web
    // 强制归一化，确保前端筛选器能覆盖所有条目
    if (typeRaw === '剧场版' || typeRaw === 'Movie' || typeRaw === '电影') type = 'Movie';
    else if (typeRaw === 'OVA' || typeRaw === 'OAD') type = 'OVA';
    else if (typeRaw === 'Web' || typeRaw === 'WEB' || typeRaw === '动态漫画' || typeRaw === '其他') type = 'Web';
    else if (typeRaw === '电视剧' || typeRaw === '日剧') type = 'TV';
    else type = 'TV'; // Fallback (包括 'TV' 自己) 

    const eps = bgm.eps || 0;
    const total_eps = bgm.total_episodes || 0;

    // Staff
    const infobox = bgm.infobox || [];
    const studio = findInfoValue(infobox, ['动画制作', '制作', 'Animation Work', 'アニメーション制作']) || '';
    const director = findInfoValue(infobox, ['导演', '监督', 'Director']) || '';
    const writer = findInfoValue(infobox, ['脚本', '系列构成', 'Series Composition', 'Script']) || '';
    const music = findInfoValue(infobox, ['音乐', 'Music']) || '';
    const char_design = findInfoValue(infobox, ['人物设定', '角色设计', 'Character Design']) || '';
    const original = findInfoValue(infobox, ['原作', 'Original Work']) || '';

    // Tags (Top 15)
    const tags = bgm.tags 
        ? bgm.tags.sort((a, b) => b.count - a.count).slice(0, 15).map(t => t.name)
        : [];

    // Sites
    const sites = [];
    sites.push({ site: 'bangumi', id: id.toString() });
    if (extra && extra.sites) {
        const bili = extra.sites.find(s => s.site === 'bilibili');
        if (bili) sites.push({ site: 'bilibili', id: bili.id });
    }

    return {
        id, name, cn, img, summary,
        date, year, month, // Added month
        type, eps, total_eps,
        score, rank, total, score_chart, collection,
        studio, director, writer, music, char_design, original,
        tags, sites
    };
}

async function merge() {
    console.time('Merge Time');
    console.log('Start processing (Season Support Mode)...');
    
    try {
        if (!fs.existsSync(SUBJECT_DIR)) {
            console.error(`Error: Subject directory not found: ${SUBJECT_DIR}`);
            process.exit(1);
        }
        
        const files = await fs.promises.readdir(SUBJECT_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        const db = [];
        let processed = 0;

        for (const file of jsonFiles) {
            const filePath = path.join(SUBJECT_DIR, file);
            try {
                const content = await fs.promises.readFile(filePath, 'utf-8');
                const rawData = JSON.parse(content);
                const item = transformSubject(rawData);
                if (item) {
                    db.push(item);
                }
            } catch (err) { } // Ignore errors for individual files
            
            processed++;
            if (processed % 2000 === 0) process.stdout.write('.');
        }

        // Sort by Rank
        db.sort((a, b) => {
            const rankA = (a.rank && a.rank > 0) ? a.rank : 999999;
            const rankB = (b.rank && b.rank > 0) ? b.rank : 999999;
            if (rankA !== rankB) return rankA - rankB;
            return b.collection.collect - a.collection.collect;
        });

        console.log('\nWriting database...');
        // Ensure output dir exists
        const outputDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(db));
        
        const stats = await fs.promises.stat(OUTPUT_FILE);
        console.log(`\nDONE!`);
        console.log(`Total Valid Items: ${db.length}`);
        console.log(`File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.timeEnd('Merge Time');

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

merge();
