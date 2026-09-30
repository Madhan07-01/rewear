/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider, useDemo } from './context/DemoContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import { LocationModal } from './components/LocationModal';

import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { StyleMatchWizardPage } from './pages/StyleMatchWizardPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyRentalsPage } from './pages/MyRentalsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AiFitStudioPage } from './pages/AiFitStudioPage';
import { ReViveHubPage } from './pages/ReViveHubPage';
import { Product, Order } from './types';

function MainApp() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [productPageAction, setProductPageAction] = useState<string | undefined>(undefined);

  const navigateTo = (path: string) => {
    // Parse query params if any
    const [pathname, search] = path.split('?');
    const query = new URLSearchParams(search || '');
    const action = query.get('action');
    if (action) {
      setProductPageAction(action);
    } else {
      setProductPageAction(undefined);
    }

    if (pathname.startsWith('/product/')) {
      const prodId = pathname.replace('/product/', '');
      fetch(`/api/products/${prodId}`)
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            setSelectedProduct(data.product);
            setCurrentPath(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        })
        .catch(console.error);
      return;
    }

    if (pathname.startsWith('/checkout/')) {
      const prodId = pathname.replace('/checkout/', '');
      fetch(`/api/products/${prodId}`)
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            setSelectedProduct(data.product);
            setCurrentPath(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        })
        .catch(console.error);
      return;
    }

    if (pathname.startsWith('/order/')) {
      const orderId = pathname.replace('/order/', '');
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order) {
            setActiveOrder(data.order);
            setCurrentPath(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        })
        .catch(console.error);
      return;
    }

    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPath(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPath(`/checkout/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveOrder(order);
    setCurrentPath(`/order/${order.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F1] text-[#18212B]">
      {/* Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenLocationModal={() => setShowLocationModal(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPath === '/' && (
          <LandingPage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath.startsWith('/catalog') && (
          <CatalogPage
            onSelectProduct={handleSelectProduct}
            savedOnly={currentPath.includes('filter=saved')}
          />
        )}

        {currentPath === '/style-match' && (
          <StyleMatchWizardPage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath === '/tryon' && (
          <AiFitStudioPage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPath.startsWith('/product/') && selectedProduct && (
          <ProductDetailPage
            productId={selectedProduct.id}
            onNavigate={navigateTo}
            onStartCheckout={handleStartCheckout}
            initialAction={productPageAction}
          />
        )}

        {currentPath.startsWith('/checkout/') && selectedProduct && (
          <CheckoutPage
            product={selectedProduct}
            onNavigate={navigateTo}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPath.startsWith('/order/') && activeOrder && (
          <BookingConfirmationPage
            order={activeOrder}
            onNavigate={navigateTo}
            onOrderUpdated={(upd) => setActiveOrder(upd)}
          />
        )}

        {currentPath === '/my-rentals' && (
          <MyRentalsPage
            onNavigate={navigateTo}
            onOpenOrder={(ord) => {
              setActiveOrder(ord);
              setCurrentPath(`/order/${ord.id}`);
            }}
          />
        )}

        {currentPath === '/profile' && <ProfilePage />}

        {currentPath === '/seller' && <SellerDashboardPage />}

        {(currentPath === '/revive' || currentPath.startsWith('/revive')) && (
          <ReViveHubPage
            onNavigate={navigateTo}
            onOpenProductDetail={(prod) => {
              handleSelectProduct(prod);
            }}
          />
        )}

        {currentPath === '/admin' && <AdminDashboardPage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Hackathon Demo Floating Bar */}
      <HackathonDemoBar onNavigate={navigateTo} />

      {/* Hyperlocal Location Selector Modal */}
      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <MainApp />
      </DemoProvider>
    </AuthProvider>
  );
}
