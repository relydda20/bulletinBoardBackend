import { nanoid } from 'nanoid';

// Export function yang generate nanoid
const generateShortId = () => nanoid(8); // 8 karakter, bisa disesuaikan

// Export sebagai default untuk kemudahan import
export default generateShortId;