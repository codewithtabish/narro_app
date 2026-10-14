import { Footer } from "@/components/site/general/footers/footer";
import { Container } from "@/components/site/general/layout/container";
import { Navbar } from "@/components/site/general/navbar/navbar";
import React from "react";

type MarketingLayoutProps = {
  children: React.ReactNode;
};

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return <div>
    <Container>
    <Navbar/>
    {children}
    <Footer/>
    </Container>
    </div>;
};

export default MarketingLayout;