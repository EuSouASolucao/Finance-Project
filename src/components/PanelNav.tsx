import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

export type PanelNavItem = { title: string; url: string; icon: LucideIcon };

type PanelNavProps = {
  items: PanelNavItem[];
  isDarkMode: boolean;
};

const indicatorEase = 'cubic-bezier(0.22, 1, 0.36, 1)';

export default function PanelNav({ items, isDarkMode }: PanelNavProps) {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIndex = items.findIndex(item =>
    Boolean(matchPath({ path: item.url, end: item.url === '/painel' }, pathname)),
  );

  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    height: 0,
    top: 0,
    opacity: 0,
    ready: false,
  });

  const updateIndicator = useCallback(() => {
    const container = scrollRef.current;
    const link = activeIndex >= 0 ? linkRefs.current[activeIndex] : null;
    if (!container || !link) {
      setIndicator(prev => ({ ...prev, opacity: 0 }));
      return;
    }
    const left = link.offsetLeft - container.scrollLeft;
    const top = link.offsetTop - container.scrollTop;
    setIndicator({
      left,
      width: link.offsetWidth,
      height: link.offsetHeight,
      top,
      opacity: 1,
      ready: true,
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicator();
    const id = requestAnimationFrame(updateIndicator);
    const link = activeIndex >= 0 ? linkRefs.current[activeIndex] : null;
    if (link && scrollRef.current?.contains(link)) {
      link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    return () => cancelAnimationFrame(id);
  }, [updateIndicator, pathname, activeIndex]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    const ro = new ResizeObserver(() => updateIndicator());
    ro.observe(container);
    window.addEventListener('resize', updateIndicator);
    container.addEventListener('scroll', updateIndicator, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateIndicator);
      container.removeEventListener('scroll', updateIndicator);
    };
  }, [updateIndicator]);

  const navShell = isDarkMode
    ? 'mx-auto mb-3 flex w-full max-w-6xl flex-col rounded-2xl bg-slate-950/90 p-2 shadow-[0_14px_44px_-14px_rgb(0_0_0_/_0.48),0_8px_22px_-12px_rgb(29_78_216_/_0.14)] ring-1 ring-slate-800/90'
    : 'mx-auto mb-3 flex w-full max-w-6xl flex-col rounded-2xl bg-white/90 p-2 shadow-xl shadow-slate-200/80 ring-1 ring-slate-200';

  const navLinkBase = isDarkMode
    ? 'relative z-[1] flex min-w-fit shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white'
    : 'relative z-[1] flex min-w-fit shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100/90 hover:text-slate-900';

  const activeLink =
    'text-white hover:bg-transparent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  return (
    <nav className={navShell}>
      <div
        ref={scrollRef}
        className={cn(
          'relative flex items-center justify-center gap-1 overflow-x-auto overflow-y-visible',
        )}
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute z-0 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 shadow-lg transition-[left,top,width,height,opacity] duration-300',
            isDarkMode ? 'shadow-black/35' : 'shadow-blue-700/25',
          )}
          style={{
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
            opacity: indicator.ready ? indicator.opacity : 0,
            transitionTimingFunction: indicatorEase,
          }}
        />
        {items.map((item, index) => (
          <NavLink
            key={item.title}
            ref={el => {
              linkRefs.current[index] = el;
            }}
            to={item.url}
            end={item.url === '/painel'}
            className={navLinkBase}
            activeClassName={activeLink}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            {item.title}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
