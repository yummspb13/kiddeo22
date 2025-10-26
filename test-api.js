// Тест API для проверки slug полей
const testApi = async () => {
  try {
    console.log('Тестируем API /api/homepage/content...');
    
    const response = await fetch('http://localhost:3000/api/homepage/content?citySlug=moskva');
    const data = await response.json();
    
    console.log('Полученные данные:', data);
    
    // Проверяем каждый блок
    Object.keys(data).forEach(blockType => {
      const block = data[blockType];
      if (block.content && block.content.length > 0) {
        console.log(`\n=== Блок ${blockType} ===`);
        console.log('Количество элементов:', block.content.length);
        
        block.content.forEach((item, index) => {
          console.log(`Элемент ${index + 1}:`, {
            type: item.type,
            id: item.id,
            slug: item.slug,
            title: item.title,
            hasSlug: !!item.slug
          });
        });
      }
    });
    
  } catch (error) {
    console.error('Ошибка при тестировании API:', error);
  }
};

// Запускаем тест
testApi();
