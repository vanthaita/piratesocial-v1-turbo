'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import FeedPost from './FeedPost';
import axiosInstance from '@/helper/axiosIntance';

interface User {
  id: number;
  name: string;
  providerId: string;
  picture: string;
}

interface PostData {
  id: number;
  userId: number;
  content: string;
  imagesUrl: string[];
  createdAt: string;
  user: User;
  likes: any[];
  comments: any[];
  commentsCount: number;
  likesCount: number;
  retweetsCount: number;
}

const FeedTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const TAKE = 10;

  const skipRef = useRef(0); 
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFirstLoad = useRef(true);

  const loadPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get('feed-posts/all', {
        params: { skip: skipRef.current, take: TAKE },
      });
      const data = response.data;

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
        skipRef.current += TAKE;
        console.log('Updated Skip Value:', skipRef.current);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadPosts();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    setPosts([]);
    skipRef.current = 0;
    setHasMore(true); 
    loadPosts();
  }, [activeTab]);

  return (
    <div className="mx-auto h-full w-full">
      <div className="flex sticky top-0 z-10 bg-white border-gray-200 shadow-md">
        <button
          className={`px-4 py-2 text-lg font-semibold ${
            activeTab === 'discover'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600'
          } focus:outline-none`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button
          className={`px-4 py-2 text-lg font-semibold ${
            activeTab === 'following'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600'
          } focus:outline-none`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      <ScrollArea
        id="scroll-area"
        className="h-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"
      >
        <div>
          {posts.map((post, index) => (
            <FeedPost key={index} {...post} />
          ))}
          {loading && <p className="text-center my-4 text-gray-500">Loading...</p>}
          {!hasMore && !loading && (
            <p className="text-center my-4 text-gray-500">No more posts to display.</p>
          )}
          <div ref={lastPostRef} className="invisible" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default FeedTabs;