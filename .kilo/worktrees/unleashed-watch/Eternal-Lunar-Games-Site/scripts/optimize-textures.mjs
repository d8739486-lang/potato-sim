import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';

// Настройки
const INPUT_DIR = './public/textures'; // можно изменить на папку с текстурами
const OUTPUT_DIR = './dist/textures';
const MAX_SIZE = 1024;
const QUALITY = 80;

function nearestPowerOfTwo(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
}

async function processTextures() {
    console.log('Поиск текстур...');
    
    const files = await glob(`${INPUT_DIR}/**/*.{jpg,jpeg,png}`);
    
    if (files.length === 0) {
        console.log(`Текстуры не найдены в директории ${INPUT_DIR}.`);
        return;
    }

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const file of files) {
        try {
            const relativePath = path.relative(INPUT_DIR, file);
            const parsedPath = path.parse(relativePath);
            
            const outDir = path.join(OUTPUT_DIR, parsedPath.dir);
            await fs.mkdir(outDir, { recursive: true });

            const stats = await fs.stat(file);
            totalOriginalSize += stats.size;

            const image = sharp(file);
            const metadata = await image.metadata();

            let newWidth = nearestPowerOfTwo(metadata.width);
            let newHeight = nearestPowerOfTwo(metadata.height);
            
            if (newWidth > MAX_SIZE) newWidth = MAX_SIZE;
            if (newHeight > MAX_SIZE) newHeight = MAX_SIZE;

            const processedImage = image.resize(newWidth, newHeight, {
                fit: 'inside',
                withoutEnlargement: true 
            });

            // Сохраняем WebP
            const webpPath = path.join(outDir, `${parsedPath.name}.webp`);
            await processedImage
                .webp({ quality: QUALITY, effort: 6 })
                .toFile(webpPath);
            const webpStats = await fs.stat(webpPath);
            totalOptimizedSize += webpStats.size;

            // Сохраняем AVIF
            const avifPath = path.join(outDir, `${parsedPath.name}.avif`);
            await processedImage
                .avif({ quality: QUALITY - 5, effort: 4 })
                .toFile(avifPath);

            console.log(`✅ Обработан: ${relativePath}`);
            console.log(`   Размер: ${metadata.width}x${metadata.height} -> ${newWidth}x${newHeight}`);
            console.log(`   Вес WebP: ${(webpStats.size / 1024).toFixed(1)} KB (сжато на ${((1 - webpStats.size/stats.size)*100).toFixed(0)}%)`);

        } catch (err) {
            console.error(`❌ Ошибка обработки файла ${file}:`, err);
        }
    }

    const origMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
    const optMB = (totalOptimizedSize / 1024 / 1024).toFixed(2);
    const saved = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
    
    console.log('\n================================');
    console.log('🎉 ОПТИМИЗАЦИЯ ЗАВЕРШЕНА');
    console.log(`Исходный размер: ${origMB} MB`);
    console.log(`Оптимизированный размер (WebP): ${optMB} MB`);
    console.log(`Сэкономлено места: ${saved}%`);
    console.log('================================\n');
}

processTextures();
