import React, { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Plus, X, Loader, UtensilsCrossed, Leaf, Clock, Languages, ChevronDown, Image as ImageIcon, Star, ShoppingCart, Users, Minus } from 'lucide-react';

// --- Main App Component ---
// Manages the overall state and renders different screens of the application.
export default function App() {
  const [view, setView] = useState('input');
  const [ingredients, setIngredients] = useState([]);
  const [servings, setServings] = useState(2);
  const [preferences, setPreferences] = useState({
    type: 'Any',
    time: 'Any',
    language: 'English',
  });
  const [recipe, setRecipe] = useState(null);
  const [recipeImage, setRecipeImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  // --- Main Recipe Generation Function (Now calls Backend) ---
  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError("Please add at least one ingredient.");
      return;
    }
    setError('');
    setIsLoading(true);
    setView('loading');

    try {
      setLoadingMessage('Calculating your perfect recipe...');

      const ingredientsText = ingredients.map(ing => `${ing.name} (${ing.qty} ${ing.unit})`).join(', ');
      const preferenceText = `Meal type: ${preferences.type}. Cooking time: ${preferences.time}.`;

      // --- Make the API call to your custom backend ---
      // IMPORTANT: Ensure your backend Node.js server is running on http://localhost:3001
      // In production, this URL will be your deployed backend's URL.
      const response = await fetch('http://localhost:3001/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredientsText,
          preferenceText,
          servings,
          language: preferences.language,
        }),
      });

      if (!response.ok) {
        // If backend sends an error response (e.g., 500, 400), parse and throw it
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Backend sends back 'recipe' and 'imageUrl' in a single JSON object
      const { recipe, imageUrl } = await response.json();

      setRecipe(recipe);
      setRecipeImage(imageUrl);

      // This message can remain for UX, even though image generation happens on backend now
      setLoadingMessage('Painting a picture of your meal...');

      setView('recipe');

    } catch (e) {
      console.error("Frontend error during recipe generation:", e);
      // Display the error message received from the backend, or a generic one
      setError(e.message || "Sorry, the kitchen is a bit busy! Couldn't generate a recipe. Please try again.");
      setView('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setView('input');
    setRecipe(null);
    setRecipeImage('');
    // Reset inputs for a truly fresh start
    setIngredients([]);
    setServings(2);
    setPreferences({
      type: 'Any',
      time: 'Any',
      language: 'English',
    });
    setError(''); // Clear any previous errors
  };

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <LoadingScreen message={loadingMessage} />;
      case 'recipe':
        return <RecipeDisplay recipe={recipe} imageUrl={recipeImage} onStartOver={handleStartOver} />;
      default:
        return <IngredientInput
                  ingredients={ingredients}
                  setIngredients={setIngredients}
                  servings={servings}
                  setServings={setServings}
                  preferences={preferences}
                  setPreferences={setPreferences}
                  onGenerateRecipe={handleGenerateRecipe}
                  error={error}
                  setError={setError}
                />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Merriweather', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .animate-pop-in { animation: popIn 0.4s ease-out forwards; }
      `}</style>
      <div className="bg-gray-100 font-sans min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <Header />
          <div className="p-6 md:p-8">{renderContent()}</div>
        </div>
        <div className="text-center mt-6 text-stone-500 text-xs px-4">
            <p className="italic">"Laughter is brightest where food is best." - Irish Proverb</p>
            <p className="mt-2 font-semibold">Created with ❤️ by Saurav Jha for all Foodies</p>
        </div>
      </div>
    </>
  );
}

// --- Components (These remain unchanged from your original code) ---

const Header = () => (
  <div className="bg-gradient-to-br from-stone-800 to-stone-700 p-5 text-white flex items-center space-x-4">
    <ChefHat size={32} className="text-amber-400" />
    <div>
      <h1 className="text-xl font-bold font-serif">AI Recipe Assistant</h1>
      <p className="text-xs opacity-80">Your Personal Culinary Genius</p>
    </div>
  </div>
);

const IngredientInput = ({ ingredients, setIngredients, servings, setServings, preferences, setPreferences, onGenerateRecipe, error, setError }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('grams');

  const handleAddIngredient = () => {
    if (name && qty) {
      setIngredients([...ingredients, { name: name.trim().toLowerCase(), qty, unit }]);
      setName('');
      setQty('');
      setError('');
    }
  };

  const handleRemoveIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-semibold text-stone-700 mb-3">What's in your kitchen?</h2>
      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-2 mb-4 p-3 bg-stone-50 rounded-xl border">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingredient Name" className="px-3 py-2 border border-stone-300 rounded-lg w-full focus:ring-2 focus:ring-amber-500"/>
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" className="px-3 py-2 border border-stone-300 rounded-lg w-full focus:ring-2 focus:ring-amber-500"/>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="px-3 py-2 border border-stone-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-amber-500">
          <option>grams</option>
          <option>kg</option>
          <option>pieces</option>
          <option>ml</option>
          <option>tbsp</option>
          <option>tsp</option>
        </select>
        <button onClick={handleAddIngredient} className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors shadow-md flex items-center justify-center transform hover:scale-110" aria-label="Add Ingredient">
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-2 mb-6 min-h-[44px]">
        {ingredients.map((ing, index) => (
          <div key={index} className="bg-stone-100 text-stone-800 capitalize px-4 py-2 rounded-lg flex items-center justify-between text-sm font-medium animate-pop-in">
            <span>{ing.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-stone-500">{ing.qty} {ing.unit}</span>
              <button onClick={() => handleRemoveIngredient(index)} className="text-stone-500 hover:text-red-600"><X size={16} /></button>
            </div>
          </div>
        ))}
        {ingredients.length === 0 && <span className="text-sm text-stone-400 p-2 block text-center">Add some ingredients to get started...</span>}
      </div>

      <h2 className="text-lg font-semibold text-stone-700 mb-3">Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col">
            <label className="text-sm font-medium text-stone-500 mb-1">Servings</label>
            <div className="flex items-center">
                <button onClick={() => setServings(s => Math.max(1, s - 1))} className="p-2 border border-stone-300 rounded-l-lg bg-stone-100 hover:bg-stone-200"><Minus size={16}/></button>
                <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} className="w-full text-center px-2 py-1.5 border-t border-b border-stone-300 focus:ring-2 focus:ring-amber-500" />
                <button onClick={() => setServings(s => s + 1)} className="p-2 border border-stone-300 rounded-r-lg bg-stone-100 hover:bg-stone-200"><Plus size={16}/></button>
            </div>
        </div>
        <PreferenceSelect icon={<Leaf size={20} className="text-stone-400" />} value={preferences.type} onChange={(e) => setPreferences({...preferences, type: e.target.value})} options={['Any', 'Vegetarian', 'Vegan', 'Gluten-Free']} />
        <PreferenceSelect icon={<Clock size={20} className="text-stone-400" />} value={preferences.time} onChange={(e) => setPreferences({...preferences, time: e.target.value})} options={['Any', 'Under 15 mins', 'Under 30 mins', 'Over 30 mins']} />
        <PreferenceSelect icon={<Languages size={20} className="text-stone-400" />} value={preferences.language} onChange={(e) => setPreferences({...preferences, language: e.target.value})} options={['English', 'Hindi', 'Punjabi', 'Gujarati', 'Maithili', 'Bhojpuri', 'Spanish', 'French']} />
      </div>

      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

      <button
        onClick={onGenerateRecipe}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
      >
        <Sparkles size={20} />
        <span>Create My Recipe</span>
      </button>
    </div>
  );
};

const PreferenceSelect = ({ icon, value, onChange, options }) => {
    const labelMap = {
        'Any': 'Meal Type',
        'English': 'Language',
    };
    const label = labelMap[options[0]] || 'Preference';

    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-stone-500 mb-1 capitalize">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">{icon}</div>
                <select value={value} onChange={onChange} className="w-full pl-11 pr-8 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none bg-white transition">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none"><ChevronDown size={18} className="text-stone-400" /></div>
            </div>
        </div>
    );
};

const LoadingScreen = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[400px] animate-fade-in">
    <UtensilsCrossed className="text-amber-500 animate-bounce" size={48} />
    <p className="mt-6 text-stone-600 font-semibold text-lg">{message}</p>
  </div>
);

const RecipeDisplay = ({ recipe, imageUrl, onStartOver }) => {
  if (!recipe) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
        {imageUrl ?
          <img src={imageUrl} alt={recipe.title} className="w-full h-64 object-cover" /> :
          <div className="w-full h-64 bg-stone-200 flex items-center justify-center"><ImageIcon className="text-stone-400" size={48} /></div>
        }
      </div>
      <h2 className="font-serif text-4xl font-bold text-stone-800 mb-3 text-center">{recipe.title}</h2>
      <p className="text-stone-600 mb-6 text-center italic">"{recipe.description}"</p>

      <div className="flex justify-around text-center mb-8 bg-stone-50 p-4 rounded-xl border">
        <div><p className="text-sm text-stone-500">Prep</p><p className="font-bold text-stone-800">{recipe.prepTime}</p></div>
        <div className="border-l border-stone-200"></div>
        <div><p className="text-sm text-stone-500">Cook</p><p className="font-bold text-stone-800">{recipe.cookTime}</p></div>
        <div className="border-l border-stone-200"></div>
        <div><p className="text-sm text-stone-500">Serves</p><p className="font-bold text-stone-800">{recipe.servings}</p></div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-700 mb-3">Ingredients</h3>
          <ul className="space-y-2 text-stone-700 columns-1 md:columns-2">
            {recipe.ingredients.map((ing, i) => <li key={i} className="flex items-start mb-2"><span className="text-amber-500 mr-3 mt-1">&#10003;</span><span>{ing}</span></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-700 mb-3">Instructions</h3>
          <ol className="space-y-4 text-stone-700">
            {recipe.instructions.map((step, i) => <li key={i} className="flex items-start"><span className="font-bold text-amber-600 mr-3">{i + 1}.</span><span className="flex-1">{step}</span></li>)}
          </ol>
        </div>
      </div>

      <button
        onClick={onStartOver}
        className="w-full mt-8 bg-stone-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center space-x-2"
      >
        <ChefHat size={20} />
        <span>Create Another Recipe</span>
      </button>
    </div>
  );
};