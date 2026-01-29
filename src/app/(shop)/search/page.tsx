import { redirect } from "next/navigation";

export default function SearchPage({ searchParams }: { searchParams: { query?: string } }) {
    if (searchParams?.query) {
        redirect(`/products?query=${searchParams.query}`);
    }
    // If no query, just go to products
    redirect('/products');
}
