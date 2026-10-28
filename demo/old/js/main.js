gsap.registerPlugin(ScrollTrigger);

const tableScroll = document.getElementById("timeline-scroll");
const table = document.getElementById("timeline-table");
const tableHead = table.tHead;

// 画面上端に固定見出しを複製して表示する
const fixedHeader = document.createElement("div");
fixedHeader.className = "table-scroll table-header";
fixedHeader.setAttribute("aria-hidden", "true");
fixedHeader.inert = true;

const headerTable = document.createElement("table");
headerTable.append(tableHead.cloneNode(true));
fixedHeader.append(headerTable);
tableScroll.after(fixedHeader);

const sourceCells = [...tableHead.rows[0].cells];
const fixedCells = [...headerTable.tHead.rows[0].cells];

/**
 * 元の表の横スクロール位置を、固定用の見出しに同期する。
 */
const syncScroll = () => {
  fixedHeader.scrollLeft = tableScroll.scrollLeft;
};

/**
 * 表が画面上端を通過している間、固定用の見出しを表示する。
 * 左端を元の表に揃え、表の下端では見出しを上へ移動させる。
 */
const updatePosition = () => {
  const bounds = tableScroll.getBoundingClientRect();
  const tableBottom = table.getBoundingClientRect().bottom;
  const headerHeight = tableHead.getBoundingClientRect().height;

  gsap.set(fixedHeader, {
    left: bounds.left,
    autoAlpha: bounds.top <= 0 && tableBottom > 0 ? 1 : 0,
    // テーブル下端では見出しも一緒に上へ移動させる。
    y: Math.min(0, tableBottom - headerHeight),
  });
};

/**
 * 固定用の見出しの列幅・全体幅・高さを元の表に合わせる。
 * 寸法の反映後、横スクロール位置と表示位置も更新する。
 */
const syncSize = () => {
  sourceCells.forEach(
    /**
     * 元の見出しセルの幅を、同じ列の固定用セルに反映する。
     * @param {HTMLTableCellElement} cell 元の見出しセル。
     * @param {number} index 列の位置。
     */
    (cell, index) => {
      fixedCells[index].style.width = `${cell.getBoundingClientRect().width}px`;
    },
  );

  gsap.set(headerTable, { width: table.getBoundingClientRect().width });
  gsap.set(fixedHeader, {
    width: tableScroll.clientWidth,
    height: tableHead.getBoundingClientRect().height,
  });

  syncScroll();
  updatePosition();
};

syncSize();

// 表の上端が画面上端に達してから、表の下端が通過するまで固定表示する
ScrollTrigger.create({
  trigger: tableScroll,
  start: "top top",
  end: "bottom top",
  onUpdate: updatePosition,
  onToggle: updatePosition,
  onRefresh: syncSize,
});

tableScroll.addEventListener("scroll", syncScroll, { passive: true });

const resizeObserver = new ResizeObserver(
  /**
   * 元の表のサイズ変更時に、固定の開始・終了位置と見出しの寸法を再計算する。
   */
  () => {
    ScrollTrigger.refresh();
  },
);
resizeObserver.observe(tableScroll);
