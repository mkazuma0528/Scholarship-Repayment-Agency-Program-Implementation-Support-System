/**
 * 奨学金代理返還情報管理システム - パフォーマンス最適化システム
 * 企業レベルの高速性とスケーラビリティを実現する包括的な最適化
 */

class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.queryCache = new Map();
        this.computedCache = new Map();
        this.prefetchQueue = [];
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            responseTimeHistory: []
        };
        this.config = {
            maxCacheSize: 1000,
            cacheTTL: 15 * 60 * 1000, // 15分
            prefetchEnabled: true,
            compressionEnabled: true,
            batchSize: 50,
            debounceDelay: 300,
            virtualScrollThreshold: 100
        };
        this.initializeOptimizations();
    }

    initializeOptimizations() {
        // パフォーマンス監視の開始
        this.startPerformanceMonitoring();
        
        // アイドル時の前処理
        this.scheduleIdleOptimizations();
        
        // メモリ使用量監視
        this.monitorMemoryUsage();
        
        console.log('[OK] パフォーマンス最適化システムが初期化されました');
    }

    /**
     * 高度なキャッシングシステム
     */
    async get(key, fetcher, options = {}) {
        const cacheKey = this.generateCacheKey(key, options);
        const startTime = performance.now();
        
        // キャッシュヒットチェック
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                this.metrics.cacheHits++;
                this.recordResponseTime(performance.now() - startTime);
                return cached.data;
            } else {
                this.cache.delete(cacheKey);
            }
        }
        
        this.metrics.cacheMisses++;
        
        try {
            // データを取得
            const data = await fetcher();
            
            // キャッシュに保存
            this.setCache(cacheKey, data, options.ttl);
            
            // 関連データの予測的取得
            if (this.config.prefetchEnabled) {
                this.schedulePrefetch(key, data);
            }
            
            this.recordResponseTime(performance.now() - startTime);
            return data;
            
        } catch (error) {
            this.recordResponseTime(performance.now() - startTime);
            throw error;
        }
    }

    /**
     * バッチ処理による一括データ取得
     */
    async batchGet(keys, fetcher, options = {}) {
        const batchSize = options.batchSize || this.config.batchSize;
        const results = new Map();
        
        // キャッシュからヒットするものを先に取得
        const uncachedKeys = [];
        for (const key of keys) {
            const cacheKey = this.generateCacheKey(key);
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (this.isCacheValid(cached)) {
                    results.set(key, cached.data);
                    continue;
                }
            }
            uncachedKeys.push(key);
        }
        
        // 未キャッシュのデータをバッチで取得
        if (uncachedKeys.length > 0) {
            const batches = this.chunkArray(uncachedKeys, batchSize);
            const batchPromises = batches.map(batch => 
                this.executeBatch(batch, fetcher, options)
            );
            
            const batchResults = await Promise.all(batchPromises);
            
            // 結果をマージ
            for (const batchResult of batchResults) {
                for (const [key, value] of batchResult) {
                    results.set(key, value);
                }
            }
        }
        
        return results;
    }

    async executeBatch(keys, fetcher, options) {
        const startTime = performance.now();
        const results = new Map();
        
        try {
            const batchData = await fetcher(keys);
            
            // 各結果をキャッシュに保存
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const data = batchData[i];
                const cacheKey = this.generateCacheKey(key);
                
                this.setCache(cacheKey, data, options.ttl);
                results.set(key, data);
            }
            
            this.recordResponseTime(performance.now() - startTime);
            return results;
            
        } catch (error) {
            this.recordResponseTime(performance.now() - startTime);
            throw error;
        }
    }

    /**
     * クエリ結果のキャッシュ（検索結果など）
     */
    async queryCache(queryKey, queryFn, options = {}) {
        const cacheKey = `query:${JSON.stringify(queryKey)}`;
        
        if (this.queryCache.has(cacheKey)) {
            const cached = this.queryCache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                return cached.data;
            }
        }
        
        const result = await queryFn();
        this.setQueryCache(cacheKey, result, options.ttl);
        
        return result;
    }

    /**
     * 計算結果のキャッシュ（重い処理）
     */
    computeWithCache(key, computeFn, options = {}) {
        const cacheKey = `compute:${key}`;
        
        if (this.computedCache.has(cacheKey)) {
            const cached = this.computedCache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                return cached.data;
            }
        }
        
        const result = computeFn();
        this.setComputedCache(cacheKey, result, options.ttl);
        
        return result;
    }

    /**
     * 予測的データ取得（プリフェッチ）
     */
    schedulePrefetch(baseKey, currentData) {
        // 関連データを予測
        const relatedKeys = this.predictRelatedData(baseKey, currentData);
        
        for (const relatedKey of relatedKeys) {
            if (!this.cache.has(this.generateCacheKey(relatedKey))) {
                this.prefetchQueue.push({
                    key: relatedKey,
                    priority: this.calculatePrefetchPriority(relatedKey),
                    scheduledAt: Date.now()
                });
            }
        }
        
        // アイドル時に実行
        this.scheduleIdlePrefetch();
    }

    predictRelatedData(baseKey, currentData) {
        const related = [];
        
        // 従業員データの場合、関連する申請データを予測
        if (baseKey.startsWith('employee:')) {
            const employeeId = baseKey.split(':')[1];
            related.push(`applications:employee:${employeeId}`);
            related.push(`documents:employee:${employeeId}`);
        }
        
        // 申請データの場合、関連する書類データを予測
        if (baseKey.startsWith('application:')) {
            const applicationId = baseKey.split(':')[1];
            related.push(`documents:application:${applicationId}`);
        }
        
        // JASSO レポートの場合、関連期間のデータを予測
        if (baseKey.startsWith('jasso-report:')) {
            const [, year, month] = baseKey.split(':');
            related.push(`jasso-report:${year}:${parseInt(month) + 1}`);
            related.push(`jasso-report:${year}:${parseInt(month) - 1}`);
        }
        
        return related;
    }

    scheduleIdlePrefetch() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.executePrefetchBatch();
            }, { timeout: 5000 });
        } else {
            setTimeout(() => {
                this.executePrefetchBatch();
            }, 100);
        }
    }

    async executePrefetchBatch() {
        if (this.prefetchQueue.length === 0) return;
        
        // 優先度順にソート
        this.prefetchQueue.sort((a, b) => b.priority - a.priority);
        
        // 上位5件を実行
        const batch = this.prefetchQueue.splice(0, 5);
        
        for (const item of batch) {
            try {
                // 実際のデータ取得は省略（模擬的な実装）
                await this.prefetchData(item.key);
            } catch (error) {
                console.warn('プリフェッチエラー:', error);
            }
        }
    }

    async prefetchData(key) {
        // 実装: 実際のデータ取得ロジック
        // この例では模擬的な実装
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`prefetched data for ${key}`);
            }, 100);
        });
    }

    /**
     * 仮想スクロール用のデータ管理
     */
    createVirtualScrollManager(containerSelector, itemHeight, renderItem) {
        return new VirtualScrollManager(containerSelector, itemHeight, renderItem, this);
    }

    /**
     * デバウンス処理
     */
    debounce(func, delay = this.config.debounceDelay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * スロットル処理
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * データ圧縮
     */
    compressData(data) {
        if (!this.config.compressionEnabled) return data;
        
        try {
            // 簡易的な圧縮（実際の実装では LZ-string などを使用）
            return JSON.stringify(data);
        } catch (error) {
            console.warn('データ圧縮エラー:', error);
            return data;
        }
    }

    decompressData(compressedData) {
        if (!this.config.compressionEnabled) return compressedData;
        
        try {
            return JSON.parse(compressedData);
        } catch (error) {
            console.warn('データ展開エラー:', error);
            return compressedData;
        }
    }

    /**
     * パフォーマンス監視
     */
    startPerformanceMonitoring() {
        // リソース使用量監視
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 30000); // 30秒間隔
        
        // ページロード時のメトリクス記録
        window.addEventListener('load', () => {
            this.recordPageLoadMetrics();
        });
    }

    collectPerformanceMetrics() {
        const metrics = {
            cacheHitRate: this.getCacheHitRate(),
            memoryUsage: this.getMemoryUsage(),
            cacheSize: this.cache.size,
            averageResponseTime: this.metrics.averageResponseTime,
            timestamp: Date.now()
        };
        
        // メトリクスを記録（実際の実装では分析サービスに送信）
        console.log('パフォーマンスメトリクス:', metrics);
        
        return metrics;
    }

    recordPageLoadMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const metrics = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: this.getFirstPaint(),
                totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
            };
            
            console.log('ページロードメトリクス:', metrics);
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    /**
     * メモリ使用量監視
     */
    monitorMemoryUsage() {
        setInterval(() => {
            const usage = this.getMemoryUsage();
            
            // メモリ使用量が多い場合はキャッシュをクリア
            if (usage.percentage > 80) {
                this.performMemoryCleanup();
            }
        }, 60000); // 1分間隔
    }

    getMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
            };
        }
        return { percentage: 0 };
    }

    performMemoryCleanup() {
        console.log('メモリクリーンアップを実行中...');
        
        // 古いキャッシュエントリを削除
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.createdAt > this.config.cacheTTL / 2) {
                this.cache.delete(key);
            }
        }
        
        // クエリキャッシュもクリーンアップ
        for (const [key, entry] of this.queryCache.entries()) {
            if (now - entry.createdAt > this.config.cacheTTL / 2) {
                this.queryCache.delete(key);
            }
        }
        
        // プリフェッチキューをクリア
        this.prefetchQueue = [];
        
        console.log('メモリクリーンアップが完了しました');
    }

    // ユーティリティメソッド
    generateCacheKey(key, options = {}) {
        const keyStr = typeof key === 'string' ? key : JSON.stringify(key);
        const optionsStr = Object.keys(options).length > 0 ? JSON.stringify(options) : '';
        return `${keyStr}:${optionsStr}`;
    }

    isCacheValid(cacheEntry) {
        const now = Date.now();
        return now - cacheEntry.createdAt < (cacheEntry.ttl || this.config.cacheTTL);
    }

    setCache(key, data, ttl) {
        if (this.cache.size >= this.config.maxCacheSize) {
            this.evictOldestCache();
        }
        
        this.cache.set(key, {
            data: this.compressData(data),
            createdAt: Date.now(),
            ttl: ttl || this.config.cacheTTL,
            hits: 0
        });
    }

    setQueryCache(key, data, ttl) {
        this.queryCache.set(key, {
            data: data,
            createdAt: Date.now(),
            ttl: ttl || this.config.cacheTTL
        });
    }

    setComputedCache(key, data, ttl) {
        this.computedCache.set(key, {
            data: data,
            createdAt: Date.now(),
            ttl: ttl || this.config.cacheTTL
        });
    }

    evictOldestCache() {
        const oldest = this.findOldestCacheEntry();
        if (oldest) {
            this.cache.delete(oldest.key);
        }
    }

    findOldestCacheEntry() {
        let oldest = null;
        for (const [key, entry] of this.cache.entries()) {
            if (!oldest || entry.createdAt < oldest.entry.createdAt) {
                oldest = { key, entry };
            }
        }
        return oldest;
    }

    calculatePrefetchPriority(key) {
        // 基本優先度
        let priority = 1;
        
        // キーの種類による優先度調整
        if (key.includes('employee')) priority += 3;
        if (key.includes('application')) priority += 2;
        if (key.includes('document')) priority += 1;
        
        return priority;
    }

    recordResponseTime(time) {
        this.metrics.totalRequests++;
        this.metrics.responseTimeHistory.push(time);
        
        // 履歴を100件に制限
        if (this.metrics.responseTimeHistory.length > 100) {
            this.metrics.responseTimeHistory.shift();
        }
        
        // 平均応答時間を更新
        this.metrics.averageResponseTime = 
            this.metrics.responseTimeHistory.reduce((sum, time) => sum + time, 0) / 
            this.metrics.responseTimeHistory.length;
    }

    getCacheHitRate() {
        const total = this.metrics.cacheHits + this.metrics.cacheMisses;
        return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    scheduleIdleOptimizations() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.performIdleOptimizations();
            });
        }
    }

    performIdleOptimizations() {
        // アイドル時の最適化処理
        this.precomputeFrequentQueries();
        this.optimizeCacheLayout();
        this.predictiveDataLoading();
    }

    precomputeFrequentQueries() {
        // よく使用されるクエリを事前計算
        const frequentQueries = [
            'dashboard_summary',
            'recent_applications',
            'pending_approvals'
        ];
        
        // 実装は省略
    }

    optimizeCacheLayout() {
        // キャッシュレイアウトの最適化
        // アクセス頻度の高いデータを高速アクセス可能な位置に配置
    }

    predictiveDataLoading() {
        // ユーザーの行動パターンに基づく予測的データ読み込み
        // 機械学習的なアプローチも可能
    }

    // パブリックAPI
    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.getCacheHitRate(),
            cacheSize: this.cache.size,
            queryCacheSize: this.queryCache.size,
            computedCacheSize: this.computedCache.size,
            prefetchQueueSize: this.prefetchQueue.length
        };
    }

    clearCache(pattern) {
        if (pattern) {
            // パターンマッチングでキャッシュをクリア
            const regex = new RegExp(pattern);
            for (const key of this.cache.keys()) {
                if (regex.test(key)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // 全キャッシュをクリア
            this.cache.clear();
            this.queryCache.clear();
            this.computedCache.clear();
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

/**
 * 仮想スクロールマネージャー
 */
class VirtualScrollManager {
    constructor(containerSelector, itemHeight, renderItem, optimizer) {
        this.container = document.querySelector(containerSelector);
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.optimizer = optimizer;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.totalItems = 0;
        this.viewportHeight = 0;
        this.scrollTop = 0;
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.viewportHeight = this.container.clientHeight;
        this.container.addEventListener('scroll', this.optimizer.throttle(this.onScroll.bind(this), 16));
        window.addEventListener('resize', this.optimizer.debounce(this.onResize.bind(this), 250));
    }

    setData(data) {
        this.data = data;
        this.totalItems = data.length;
        this.updateVirtualScroll();
    }

    onScroll() {
        this.scrollTop = this.container.scrollTop;
        this.updateVirtualScroll();
    }

    onResize() {
        this.viewportHeight = this.container.clientHeight;
        this.updateVirtualScroll();
    }

    updateVirtualScroll() {
        const visibleStart = Math.floor(this.scrollTop / this.itemHeight);
        const visibleEnd = Math.min(
            visibleStart + Math.ceil(this.viewportHeight / this.itemHeight) + 1,
            this.totalItems
        );

        if (visibleStart !== this.visibleStart || visibleEnd !== this.visibleEnd) {
            this.visibleStart = visibleStart;
            this.visibleEnd = visibleEnd;
            this.renderVisibleItems();
        }
    }

    renderVisibleItems() {
        const fragment = document.createDocumentFragment();
        
        // 上部の空白
        const spacerTop = document.createElement('div');
        spacerTop.style.height = `${this.visibleStart * this.itemHeight}px`;
        fragment.appendChild(spacerTop);
        
        // 表示するアイテム
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            if (this.data[i]) {
                const itemElement = this.renderItem(this.data[i], i);
                itemElement.style.height = `${this.itemHeight}px`;
                fragment.appendChild(itemElement);
            }
        }
        
        // 下部の空白
        const spacerBottom = document.createElement('div');
        spacerBottom.style.height = `${(this.totalItems - this.visibleEnd) * this.itemHeight}px`;
        fragment.appendChild(spacerBottom);
        
        // コンテナを更新
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }
}

// グローバルインスタンス作成
window.performanceOptimizer = new PerformanceOptimizer();

console.log('[OK] 奨学金代理返還システム - パフォーマンス最適化システムが初期化されました');