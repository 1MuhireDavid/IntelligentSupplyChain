import { Link, useLocation } from 'wouter';

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-1 ${location === '/' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">dashboard</span>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/market-intelligence">
          <a className={`flex flex-col items-center py-1 ${location === '/market-intelligence' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">show_chart</span>
            <span className="text-xs mt-1">Markets</span>
          </a>
        </Link>
        
        <Link href="/supply-chain">
          <a className={`flex flex-col items-center py-1 ${location === '/supply-chain' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">alt_route</span>
            <span className="text-xs mt-1">Supply Chain</span>
          </a>
        </Link>
        
        <Link href="/customs-management">
          <a className={`flex flex-col items-center py-1 ${location === '/customs-management' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">description</span>
            <span className="text-xs mt-1">Customs</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`flex flex-col items-center py-1 ${location === '/profile' ? 'text-primary' : 'text-neutral-500'}`}>
            <span className="material-icons">person</span>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
