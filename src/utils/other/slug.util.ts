export function slugifyFilename(originalName: string): string {
    return originalName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // thay khoảng trắng bằng dấu gạch ngang
        .replace(/[^a-z0-9\-\.]/g, ''); // chỉ giữ lại chữ thường, số, dấu chấm và gạch ngang
}