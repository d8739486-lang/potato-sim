const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wqcstpgssapruhxfrxen.supabase.co';
const supabaseKey = 'sb_publishable_69qcMTynbEjn0O32lgs0pw_IedYqSJI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    const games = [
        {
            title: 'Pc Master',
            description: 'Борьба с вирусами, взлом систем и расследование тайных схем корпорации Digital Dreams.\n\n3 главы доступно',
            type: 'game',
            cover_url: '/pc_master_cover.jpg',
            link: '/games/pc-master',
            status: 'Active'
        },
        {
            title: 'Симулятор Картошки',
            description: 'Выращивай картофель, расширяй грядки и создавай невероятную фермерскую империю.',
            type: 'game',
            cover_url: '/potato_sim_cover.jpg',
            link: 'https://potato-sim.vercel.app',
            status: 'Active'
        },
        {
            title: 'Неоновая Змейка',
            description: 'Классическая змейка в совершенно новом неоновом киберпанк стиле с потрясающими эффектами.',
            type: 'game',
            cover_url: '/snake_cover.png',
            link: 'https://neon-snake-six-cyan.vercel.app',
            status: 'Active'
        }
    ];

    const { data, error } = await supabase.from('projects').insert(games);
    
    if (error) {
        console.error('Error inserting games:', error);
    } else {
        console.log('Games inserted successfully!');
    }
}

seed();
