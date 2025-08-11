import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Camera, Shield, Zap, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">PhotoGallery</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Professional
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}Client Galleries
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Share your photography with clients through secure, beautiful galleries. 
            Handle payments, protect your work, and deliver an exceptional client experience.
          </p>
          <div className="space-x-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Professional tools designed specifically for photographers who want to deliver 
            exceptional client experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm">
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Galleries</h3>
            <p className="text-slate-300">
              Watermarked images, secure access codes, and protected downloads keep your work safe.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Easy Payments</h3>
            <p className="text-slate-300">
              Integrated Stripe payments let clients purchase and download their favorite images instantly.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm">
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Beautiful Galleries</h3>
            <p className="text-slate-300">
              Stunning, responsive galleries that showcase your photography in the best light.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-white/5 backdrop-blur-sm">
            <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Client Access</h3>
            <p className="text-slate-300">
              Magic link access means clients can view and purchase without creating accounts.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join photographers who trust PhotoGallery to deliver exceptional client experiences.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}