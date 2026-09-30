/**
 * PageManager - Manages page tables, virtual-to-physical address translations, and page attributes.
 */
class PageManager {
  constructor(pageSizeKb = 4) {
    this.pageSizeKb = pageSizeKb;
    // Map of processId -> Array of page objects
    this.pageTables = new Map();
  }

  createProcessPages(processId, memoryMb, priority = 5) {
    const totalKb = memoryMb * 1024;
    const pageCount = Math.ceil(totalKb / this.pageSizeKb);
    
    // Efficient sparse allocation limit for page tables (max 10,000 resident page objects for UI inspection)
    const trackedPagesCount = Math.min(pageCount, 10000);
    const pages = [];
    const now = new Date();

    for (let i = 0; i < trackedPagesCount; i++) {
      pages.push({
        pageId: `${processId}-page-${i}`,
        processId,
        pageIndex: i,
        sizeKb: this.pageSizeKb,
        location: 'FREE', // 'RAM', 'SWAP', or 'FREE'
        blockIndex: null,
        dirtyBit: false,
        refBit: 1,
        priority,
        lastAccessed: now,
        allocatedAt: now
      });
    }

    this.pageTables.set(processId, pages);
    return pages;
  }

  getProcessPages(processId) {
    return this.pageTables.get(processId) || [];
  }

  deleteProcessPages(processId) {
    this.pageTables.delete(processId);
  }

  updatePageAccess(processId, pageIndex = 0) {
    const pages = this.pageTables.get(processId);
    if (!pages || pages.length === 0) return null;
    const page = pages[pageIndex % pages.length] || pages[0];
    if (page) {
      page.lastAccessed = new Date();
      page.refBit = 1;
      page.dirtyBit = Math.random() > 0.5;
    }
    return page;
  }

  setPagesLocation(processId, location, blockIndexMap = []) {
    const pages = this.pageTables.get(processId);
    if (!pages) return;

    pages.forEach((page, idx) => {
      page.location = location;
      if (blockIndexMap[idx] !== undefined) {
        page.blockIndex = blockIndexMap[idx];
      }
    });
  }

  clear() {
    this.pageTables.clear();
  }
}

module.exports = PageManager;
