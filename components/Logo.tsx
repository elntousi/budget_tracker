import { PiggyBank } from 'lucide-react'
import React from 'react'

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2"> 
     <PiggyBank className= " stroke h-11 w-11 stroke-amber-500 stroke-[1.5]" />
     <p className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text
      text-3xl font-bold leading-tight tracking-tighter dark:from-yallow-400 dark:to-orange-500 text-transparent"> 
        BudgetTracker
      </p> 
    </a>
  );
}

export function LogoMobile() {
  return (
    <a href="/" className="flex items-center gap-2"> 
     <p className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text
      text-3xl font-bold leading-tight tracking-tighter dark:from-yallow-400 dark:to-orange-500 text-transparent"> 
        BudgetTracker
      </p> 
    </a>
  );
}
export default Logo