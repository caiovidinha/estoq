// components/MobileSwipeItem.js
import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { RiDeleteBin2Fill } from 'react-icons/ri';

const MobileSwipeItem = ({ mov, onDelete, children }) => {
  const [swiped, setSwiped] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => setSwiped(true),
    onSwipedRight: () => setSwiped(false),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  return (
    <div {...handlers} className="relative overflow-hidden">
      {/* Conteúdo do item deslocado */}
      <div
        className={`transition-transform duration-300 ${
          swiped ? '-translate-x-20' : 'translate-x-0'
        }`}
      >
        {children}
      </div>
      {/* Botão de excluir, posicionado à direita */}
      {swiped && (
        <div
          className="absolute top-0 right-0 h-full flex items-center justify-center w-20 bg-red-400 cursor-pointer hover:bg-red-500"
          onClick={() => onDelete(mov.id)}
        >
          <RiDeleteBin2Fill size={20} className="text-black" />
        </div>
      )}
    </div>
  );
};

export default MobileSwipeItem;
