import HeroSection from '../../components/common/HeroSection';
import PopularSnacks from '../../components/common/PopularSnacks';
import CategoriesSection from '../../components/common/CategoriesSection';
import SnackOfTheDay from '../../components/common/SnackOfTheDay';
import WhyNaijaSnacks from '../../components/common/WhyNaijaSnacks';
import HowItWorks from '../../components/common/HowItWorks';
import Testimonials from '../../components/common/Testimonials';
import Newsletter from '../../components/common/Newsletter';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <PopularSnacks />
      <CategoriesSection />
      <SnackOfTheDay products={[]} />
      <WhyNaijaSnacks />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default HomePage;