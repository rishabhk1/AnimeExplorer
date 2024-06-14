import {Input} from '../../@/components/ui/input'
import {Button} from '../../@/components/ui/button'
import { Loader2, Search, X } from 'lucide-react';
import { ChangeEvent, useRef, useState} from 'react';
import { Checkbox} from "../../@/components/ui/checkbox"
import { useToast } from "../../@/components/ui/use-toast" 
import { Toaster } from "../../@/components/ui/toaster"
import Loading from './Loading';

type CheckedState = boolean ;

interface AnimeData {
    id: string;
    score: number;
    metadata: {
      anime_id: string;
      name: string;
      genre: string;
      type: string;
      episodes: number;
      rating: number;
      members: string;
      image: string;
    };
  }

const SearchPage = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState<string>('');
    const [animeList, setAnimeList] = useState([]);
    const [searchDone, setSearchDone] = useState(false);
    const [isMovie, setIsMovie] = useState(true);
    const [isTV, setIsTV] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [episodeRange, setEpisodeRange] = useState({ min: '1', max: '1000' });
    const [ratingRange, setRatingRange] = useState({ min: '1', max: '10' });
    
    const { toast } = useToast();

    const floatRegex = /^[+]?[0-9]*\.?[0-9]+$/;
    const integerRegex = /^[+]?[0-9]+$/;

    const handleEpisodeRangeChange = (e: ChangeEvent<HTMLInputElement>, field: string) => {
        setEpisodeRange({ ...episodeRange, [field]: (e.target.value) });
      };
    
      const handleRatingRangeChange = (e: ChangeEvent<HTMLInputElement>, field: string) => {
        setRatingRange({ ...ratingRange, [field]: (e.target.value) });
      };

    const APIcall = async () => {
        const typeFilter = (+isMovie^+isTV)?(isMovie?`AND type = 'Movie'`:`AND type = 'TV'`):''
        try {
            
            if(query.trim().length === 0){
                toast({
                    title: "Uh oh! Please enter list of genres or animes",
                  });
                  return;
            }
            if(episodeRange.min.trim().length==0) episodeRange.min='1';
            if(episodeRange.max.trim().length==0) episodeRange.max='1000';
            if(ratingRange.min.trim().length==0) ratingRange.min='1';
            if(ratingRange.max.trim().length==0) ratingRange.max='10';
            if(!integerRegex.test(episodeRange.min) || !integerRegex.test(episodeRange.max) ){
                toast({
                    title: "Uh oh! Please enter valid episodes range",
                  });
                  return;
            }
            if(!floatRegex.test(ratingRange.min) || !floatRegex.test(ratingRange.max) ){
                toast({
                    title: "Uh oh! Please enter valid rating range",
                  });
                  return;
            }
            setIsSearching(true);
          const response = await fetch('http://localhost:8787', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({message:{
                genre: query,
                filter: `episodes >= ${episodeRange.min} AND episodes <= ${episodeRange.max} AND rating >= ${ratingRange.min} AND rating <= ${ratingRange.max} ${typeFilter}`,
            }}),
          });
    
          if (response.ok) {
            setSearchDone(true);
            const data = await response.json();
                    //APIcall();
                    setAnimeList(data.response);
           
            
          } else {
            console.error('Error:', response.status);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
              })
          }
        } catch (error) {
          console.error('Error:', error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          })
        } finally {
            setIsSearching(false);
        }
      };

    const search = async () => {
        APIcall();
    }
    return (
       
        <>
        <Toaster />
        <div className="relative h-14 w-full rounded-md">
            <Input 
                disabled={isSearching}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === 'Enter'){
                        search();
                    }
                    if(e.key === 'Escape'){
                        inputRef?.current?.blur();
                    }
                }}
                ref={inputRef} 
                className='absolute inset-0 h-full border-2 border-gray-200'
                placeholder="Enter list of genres or animes"
                />
                
            <Button 
                disabled={isSearching} 
                size='sm' 
                onClick={search} 
                className='absolute right-0 inset-y-0 h-full rounded-l-none'>
                {isSearching ?<Loader2 className='h-6 w-6 animate-spin'/> :<Search className='h-6 w-6'/>}
            </Button>
        </div>
        <div className="flex flex-col items-center space-y-4 mt-3">
            {showForm && ( <>
            <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                    <Checkbox
                        checked={isMovie}
                        onCheckedChange={(checked:CheckedState) => setIsMovie(checked)}
                    />
                    <span>Movie</span>
                </label>
                <label className="flex items-center space-x-2">
                    <Checkbox
                        checked={isTV}
                        onCheckedChange={(checked:CheckedState) => setIsTV(checked)}
                    />
                    <span>TV</span>
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <label htmlFor="episodeMin" className="mr-2">Episodes:</label>
                <Input
                    id="episodeMin"
                    value={episodeRange.min}
                    onChange={(e) => handleEpisodeRangeChange(e, 'min')}
                    className="w-16"
                />
                <span>-</span>
                <Input
                    id="episodeMax"
                    value={episodeRange.max}
                    onChange={(e) => handleEpisodeRangeChange(e, 'max')}
                    className="w-16"
                />
            </div>
            <div className="flex items-center space-x-2">
                <label htmlFor="ratingMin" className="mr-6">Rating:</label>
                <Input
                    id="ratingMin"
                    value={ratingRange.min}
                    onChange={(e) => handleRatingRangeChange(e, 'min')}
                    className="w-16"
                />
                <span>-</span>
                <Input
                    id="ratingMax"
                    value={ratingRange.max}
                    onChange={(e) => handleRatingRangeChange(e, 'max')}
                    className="w-16"
                />
            </div>
            </>)}
            <span
                className={`text-sm cursor-pointer text-gray-500`}
                onClick={() => setShowForm(!showForm)}
                >
                {showForm ? 'Hide Filters' : 'Show Filters'}
                </span>
        </div>
        {isSearching && <Loading/>}
        {(animeList.length === 0) && searchDone &&
            <div className='text-center py-4 bg-white shadow-md rounded-b-md'>
                <X className='mx-auto h-8 w-8 text-gray-400' />
                <h3 className='mt-2 text-sm font-semibold text-gray-900'>No results</h3>
                <p className='mt-1 text-sm mx-auto max-w-prose text-gray-500'>
                Sorry, we couldn't find any animes
                </p>
            </div>}
    
       
        {animeList.length>0 && <div className='py-4 divide-y divide-zinc-100 bg-white  rounded-b-md'>
        
                {
                     animeList.map((anime: AnimeData) => (
                        <div key={anime.metadata.anime_id} className='mx-auto shadow-md py-4 px-8 flex space-x-4'>
                            <div className='relative flex items-center bg-zinc-100 rounded-lg h-50 w-40 '>
                                <img src={anime.metadata.image} alt="Anime Image" className='h-50 w-40 ' />
                            </div>
                            <div className='w-full md:flex-1 space-y-2 py-1'>
                                <h1 className='md:text-lg text-base font-medium text-gray-900'>
                                    {anime.metadata.name}
                                </h1>
                                <p className='prose md:text-lg text-sm text-gray-500'>
                                    {anime.metadata.genre}
                                </p>
                                <p className='prose md:text-lg text-sm text-gray-500'>
                                    {anime.metadata.type}
                                </p>
                                {(anime.metadata.type == 'TV') && <p className='prose md:text-lg text-sm text-gray-500'>
                                    Episodes: {anime.metadata.episodes}
                                </p>}
                                <p className='md:text-lg text-sm text-gray-500'>
                                    Rating: {anime.metadata.rating}
                                </p>
                            </div>
                        </div>    
                    ))
                }
        </div>}
       
        </>
    )
}
export default SearchPage;