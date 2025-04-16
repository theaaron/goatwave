# GOATWAVE

A vaporwave-style image generation app using the BlackForestLabs API.

![goatwave-screen](https://github.com/user-attachments/assets/597e8896-aeef-4002-b8f3-f957b1c69258)


## Features

- Generate stunning vaporwave-style images using AI
- Beautiful vaporwave aesthetic UI
- Simple and intuitive interface
- Download generated images
- Secure API key management with dotenv

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- BlackForestLabs API key
- BlackForestLabs model ID

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/goatwave.git
cd goatwave
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up your environment variables:
   - Create a `.env` file in the root directory
   - Add your BlackForestLabs API key and model ID:
   ```
   BLACKFOREST_API_KEY=your_api_key_here
   MODEL_ID=your_model_id_here
   NEXT_PUBLIC_USE_MOCK_RESPONSE=false
   ```
   - For local development, you can also use `.env.local` which will override `.env` values

4. Update the model ID in `src/app/page.tsx` with your specific tuned model ID:
```javascript
model_id: process.env.MODEL_ID, // This will be securely accessed from server-side
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Enter a descriptive prompt in the text area
2. Click "Generate Image"
3. Wait for the image to be generated
4. Download the generated image

## Environment Variables

The app uses dotenv to manage environment variables:

- `BLACKFOREST_API_KEY`: Your BlackForestLabs API key (server-side only)
- `MODEL_ID`: Your BlackForestLabs model ID (server-side only)
- `NEXT_PUBLIC_USE_MOCK_RESPONSE`: Toggle for mock responses (client-side accessible)

**Security Note**: 
- The API key and model ID are kept server-side only and are not exposed to the client
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Make sure not to commit your actual API keys to version control
- When deploying to Vercel, add these environment variables in the project settings

## Technologies Used

- Next.js
- React
- Tailwind CSS
- Axios
- Dotenv
- BlackForestLabs API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- BlackForestLabs for providing the image generation API
- Vaporwave aesthetic inspiration
