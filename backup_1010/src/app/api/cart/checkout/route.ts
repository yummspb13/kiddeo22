import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/contexts/CartContext';

interface CheckoutRequest {
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: 'card' | 'cash' | 'online';
  deliveryAddress?: string;
  notes?: string;
}

// POST /api/cart/checkout - оформить заказ
export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, customerInfo, paymentMethod, deliveryAddress, notes } = body;

    // Валидация данных
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      );
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля' },
        { status: 400 }
      );
    }

    // Расчет итоговой суммы
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryAddress ? 300 : 0; // Стоимость доставки
    const total = subtotal + deliveryFee;

    // Генерация номера заказа
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // В реальном приложении здесь была бы:
    // 1. Создание заказа в БД
    // 2. Интеграция с платежной системой
    // 3. Отправка уведомлений
    // 4. Резервирование билетов/товаров

    const order = {
      id: orderNumber,
      items,
      customerInfo,
      paymentMethod,
      deliveryAddress,
      notes,
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
    };

    // Симуляция обработки платежа
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      order,
      message: 'Заказ успешно оформлен!',
      paymentUrl: paymentMethod === 'online' ? `/payment/${orderNumber}` : null
    });

  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Ошибка оформления заказа' },
      { status: 500 }
    );
  }
}

// GET /api/cart/checkout/[orderId] - получить информацию о заказе
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // В реальном приложении здесь был бы запрос к БД
    // Пока возвращаем заглушку
    return NextResponse.json({
      order: {
        id: orderId,
        status: 'completed',
        items: [],
        total: 0,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки заказа' },
      { status: 500 }
    );
  }
}
