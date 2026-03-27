import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Layers, Image as ImageIcon, Users, MessageSquare, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';

const DashboardCard = ({ title, count, icon: Icon, link, linkText }) => (
  <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-3xl font-bold font-serif">{count}</h3>
    </div>
    <h4 className="text-muted-foreground font-medium">{title}</h4>
    <div className="mt-4 pt-4 border-t">
      <Link to={link} className="text-sm text-primary hover:underline font-medium">
        {linkText}
      </Link>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    banners: 0,
    categories: 0,
    stories: 0,
    inquiries: 0,
    testimonials: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel requests using Promise.all for dashboard metrics
        const [banners, categories, stories, inquiries, testimonials] = await Promise.all([
          api.get('/banners/all'),
          api.get('/categories'),
          api.get('/stories'),
          api.get('/inquiries'),
          api.get('/testimonials') // using the public route for total count
        ]);

        setStats({
          banners: banners.data.length,
          categories: categories.data.length,
          stories: stories.data.length,
          inquiries: inquiries.data.filter(i => i.status === 'New').length, // Show New inquiries
          testimonials: testimonials.data.length
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <div className="p-12 flex justify-center"><Loader size={36} text="Loading dashboard..." /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back to the Studio Admin Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardCard 
          title="Active Banners" 
          count={stats.banners} 
          icon={Layers} 
          link="/admin/banners" 
          linkText="Manage Banners" 
        />
        <DashboardCard 
          title="Published Stories" 
          count={stats.stories} 
          icon={ImageIcon} 
          link="/admin/stories" 
          linkText="Manage Stories" 
        />
        <DashboardCard 
          title="Categories" 
          count={stats.categories} 
          icon={Users} 
          link="/admin/categories" 
          linkText="Manage Categories" 
        />
        <DashboardCard 
          title="New Inquiries" 
          count={stats.inquiries} 
          icon={MessageSquare} 
          link="/admin/crm" 
          linkText="View CRM Pipeline" 
        />
        <DashboardCard 
          title="Testimonials" 
          count={stats.testimonials} 
          icon={MessageSquare} 
          link="/admin/testimonials" 
          linkText="Manage Testimonials" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/stories" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 hover:bg-primary/90 transition-colors">
              + New Story
            </Link>
            <Link to="/admin/media" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent h-10 px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors">
              Upload Media
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
