import React, { useState } from 'react';
import { 
  Linkedin, 
  Award, 
  GraduationCap, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Users,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { 
  teamMembers, 
  teamStats, 
  teamAchievements, 
  teamCredentials,
  companyValues,
} from '@/data/teamMembers';
import { cn } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const TeamSection: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState(0);
  const [activeValueIndex, setActiveValueIndex] = useState(0);

  const iconMap = {
    Eye: Award,
    Search: BookOpen,
    Shield: Award,
    BookOpen,
  };

  const nextMember = () => {
    setSelectedMember((prev) => (prev + 1) % teamMembers.length);
  };

  const previousMember = () => {
    setSelectedMember((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const currentMember = teamMembers[selectedMember];

  return (
    <section id="team" className="section bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Meet Our Expert Team
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Former professionals from Goldman Sachs, JPMorgan, and Bridgewater bringing 
            institutional expertise to individual investors.
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
              {teamStats.totalExperience}
            </p>
            <p className="text-text-secondary">Combined Experience</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
              {teamStats.combinedAUM}
            </p>
            <p className="text-text-secondary">Assets Managed</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
              {teamStats.publicationsCount}+
            </p>
            <p className="text-text-secondary">Research Publications</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">
              {teamStats.clientsSince}
            </p>
            <p className="text-text-secondary">Serving Clients Since</p>
          </div>
        </div>

        {/* Team Member Showcase */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Member Image and Navigation */}
            <div className="relative">
              <Card className="p-8 text-center">
                <div className="relative inline-block">
                  <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-ocean-500 p-1">
                    <img
                      src={currentMember.image}
                      alt={currentMember.name}
                      className="w-full h-full rounded-full object-cover bg-background"
                    />
                  </div>
                  
                  {/* LinkedIn Badge */}
                  {currentMember.linkedinUrl && (
                    <a
                      href={currentMember.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {currentMember.name}
                </h3>
                
                <p className="text-lg text-primary-500 font-medium mb-4">
                  {currentMember.position}
                </p>

                {/* Navigation Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousMember}
                    className="w-10 h-10 p-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMember}
                    className="w-10 h-10 p-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Member Details */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h4 className="text-xl font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  Biography
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  {currentMember.bio}
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xl font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-500" />
                  Education
                </h4>
                <p className="text-text-secondary">
                  {currentMember.education}
                </p>
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-xl font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-500" />
                  Experience
                </h4>
                <p className="text-text-secondary">
                  {currentMember.experience}
                </p>
              </div>

              {/* Specializations */}
              <div>
                <h4 className="text-xl font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  Specializations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentMember.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Member Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedMember(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  selectedMember === index
                    ? 'bg-primary-500 w-8'
                    : 'bg-border hover:bg-primary-300'
                )}
              />
            ))}
          </div>
        </div>

        {/* Team Achievements */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-text-primary text-center mb-12">
            Awards & Recognition
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamAchievements.map((achievement, index) => (
              <Card key={index} className="text-center" hover padding="lg">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                
                <div className="text-2xl font-bold text-primary-500 mb-2">
                  {achievement.year}
                </div>
                
                <h4 className="font-semibold text-text-primary mb-2">
                  {achievement.achievement}
                </h4>
                
                <p className="text-text-secondary text-sm">
                  {achievement.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Company Values */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-text-primary text-center mb-12">
            Our Values
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyValues.map((value, index) => {
              const IconComponent = iconMap[value.icon as keyof typeof iconMap] || Award;
              return (
                <Card
                  key={index}
                  className={cn(
                    'p-8 cursor-pointer transition-all duration-300',
                    activeValueIndex === index ? 'ring-2 ring-primary-500 shadow-xl' : ''
                  )}
                  hover
                  onClick={() => setActiveValueIndex(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary-500" />
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-text-primary mb-3">
                        {value.title}
                      </h4>
                      <p className="text-text-secondary leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Credentials */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-text-primary mb-8">
            Professional Credentials
          </h3>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {teamCredentials.map((credential, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-text-secondary font-medium"
              >
                {credential}
              </span>
            ))}
          </div>

          <Card className="p-8 glass">
            <div className="flex items-center justify-center gap-4 mb-6">
              <MapPin className="w-6 h-6 text-primary-500" />
              <p className="text-lg text-text-secondary">
                Headquartered in New York Financial District
              </p>
            </div>
            
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Our team combines decades of Wall Street experience with cutting-edge technology 
              to deliver institutional-quality research to individual investors worldwide.
            </p>
            
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.open('https://linkedin.com/company/whitefincapital', '_blank')}
              icon={<Linkedin className="w-5 h-5" />}
            >
              Connect on LinkedIn
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;