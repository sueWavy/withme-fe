import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';

export default function Event() {
  return (
    <div className="mb-10">
      <SearchBar />
      <div className="flex justify-center">
        <div className="mt-7 grid gap-7 grid-cols-2 md:grid-cols-1">
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
          <PostCard />
        </div>
      </div>
    </div>
  );
}
