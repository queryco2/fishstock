import { FormEvent, useEffect, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { searchSymbols } from '../api/quoteApi';
import type { SymbolSearchResult } from '../types/watchItem';

type Props = {
  isOpen: boolean;
  isSuperDisguise: boolean;
  onClose: () => void;
  onAdd: (item: SymbolSearchResult) => void;
};

export function AddSymbolDialog({ isOpen, isSuperDisguise, onClose, onAdd }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen || isSuperDisguise) return;

    let cancelled = false;
    setIsSearching(true);

    searchSymbols(keyword)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, isOpen, isSuperDisguise]);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleAdd(item: SymbolSearchResult) {
    onAdd(item);
    setKeyword('');
    onClose();
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section aria-modal="true" className="dialog" role="dialog">
        <header className="dialog-header">
          <div>
            <h2>{isSuperDisguise ? '新增条目暂停' : '添加自选标的'}</h2>
            <p>{isSuperDisguise ? '当前只显示办公数据，请退出后再添加真实数据。' : '输入代码、名称或基金关键词，选择后保存到本地。'}</p>
          </div>
          <button aria-label="关闭" className="icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        {isSuperDisguise ? (
          <div className="dialog-muted">真实名称已隐藏，新增入口暂时锁定。</div>
        ) : (
          <>
            <form className="search-form" onSubmit={handleSubmit}>
              <Search size={18} />
              <input
                autoFocus
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="例如 600519 / 茅台 / ETF"
                value={keyword}
              />
            </form>

            <div className="result-list">
              {isSearching ? <div className="dialog-muted">搜索中...</div> : null}
              {results.map((item) => (
                <button className="result-row" key={`${item.market}.${item.symbol}`} onClick={() => handleAdd(item)} type="button">
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.market}.{item.symbol} / {item.type}
                    </small>
                  </span>
                  <Check size={18} aria-hidden="true" />
                </button>
              ))}
              {!isSearching && results.length === 0 ? <div className="dialog-muted">没有找到匹配结果</div> : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
