import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/contexts/CartContext';

// GET /api/cart - получить содержимое корзины
export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь была бы авторизация и получение корзины из БД
    // Пока возвращаем пустую корзину
    return NextResponse.json({
      items: [],
      total: 0,
      itemCount: 0
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки корзины' },
      { status: 500 }
    );
  }
}

// POST /api/cart - добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item } = body;

    // Валидация товара
    if (!item || !item.id || !item.title || !item.price) {
      return NextResponse.json(
        { error: 'Неверные данные товара' },
        { status: 400 }
      );
    }

    // В реальном приложении здесь была бы проверка наличия товара в БД
    // и добавление в корзину пользователя

    return NextResponse.json({
      success: true,
      message: 'Товар добавлен в корзину',
      item
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Ошибка добавления в корзину' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - обновить количество товара
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Неверные параметры' },
        { status: 400 }
      );
    }

    // В реальном приложении здесь было бы обновление в БД

    return NextResponse.json({
      success: true,
      message: 'Количество обновлено'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления корзины' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - удалить товар из корзины
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'ID товара не указан' },
        { status: 400 }
      );
    }

    // В реальном приложении здесь было бы удаление из БД

    return NextResponse.json({
      success: true,
      message: 'Товар удален из корзины'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления из корзины' },
      { status: 500 }
    );
  }
}
