import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">About</h3>
            <p className="text-sm text-neutral-600">
              Intelligent Supply Chain Optimization System helps traders in Rwanda handle their import and export operations through real-time insights and intelligent recommendations.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-sm text-neutral-600 hover:text-primary">Dashboard</a>
                </Link>
              </li>
              <li>
                <Link href="/market-intelligence">
                  <a className="text-sm text-neutral-600 hover:text-primary">Market Intelligence</a>
                </Link>
              </li>
              <li>
                <Link href="/supply-chain">
                  <a className="text-sm text-neutral-600 hover:text-primary">Supply Chain</a>
                </Link>
              </li>
              <li>
                <Link href="/customs-management">
                  <a className="text-sm text-neutral-600 hover:text-primary">Customs Management</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary">Contact Support</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-neutral-600">
                <span className="material-icons text-primary mr-2 text-sm">email</span>
                <span>contact@iscos.com</span>
              </li>
              <li className="flex items-center text-sm text-neutral-600">
                <span className="material-icons text-primary mr-2 text-sm">phone</span>
                <span>+250 788 123 456</span>
              </li>
              <li className="flex items-center text-sm text-neutral-600">
                <span className="material-icons text-primary mr-2 text-sm">location_on</span>
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-neutral-600 hover:text-primary">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary">
                <span className="material-icons">twitter</span>
              </a>
              <a href="#" className="text-neutral-600 hover:text-primary">
                <span className="material-icons">linkedin</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} Intelligent Supply Chain Optimization System. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-neutral-600 hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-primary">Terms of Service</a>
            <a href="#" className="text-sm text-neutral-600 hover:text-primary">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
