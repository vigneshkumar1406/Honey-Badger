import ReturnForm from "./ReturnForm";

export default async function ReturnsPage({searchParams}) {
 const orderNumber=String(searchParams?.order||"");
 const itemId=String(searchParams?.item||"");
 return <main className="max-w-[800px] mx-auto px-6 py-16">
   <p className="text-xs font-bold tracking-[0.25em] text-orange-600 uppercase">Returns & support</p>
   <h1 className="font-display text-4xl tracking-wider mt-2 mb-5">PRODUCT RETURN / ISSUE</h1>
   <p className="text-sm text-neutral-600 leading-relaxed mb-8">Choose a product from a delivered order on the Track Orders page. We keep the return linked to the exact ordered product so you do not need to type an order number.</p>
   <ReturnForm orderNumber={orderNumber} itemId={itemId}/>
 </main>;
}
